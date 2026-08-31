import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import disposableDomains from 'disposable-email-domains';
import { dbQuery, dbRun, getDb, saveDb } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'insightboard_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'insightboard_super_secret_refresh_key_2026';

// Gmail API OAuth2 setup
function getGmailClient() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const refreshToken = process.env.REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// Send OTP email via Gmail API
async function sendOtpEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
  const gmail = getGmailClient();
  const senderEmail = process.env.SENDER_EMAIL || 'no-reply@insightboard.app';

  if (!gmail) {
    console.warn(`[Gmail API] Missing Gmail OAuth environment variables (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN). Unable to send OTP email.`);
    return false;
  }

  const messageSubject = 'Your InsightBoard Verification OTP Code';
  const messageBody = `
Hello,

Your verification code for InsightBoard Business Intelligence is:

      ${otpCode}

This code will expire in 10 minutes. If you did not request this, please ignore this email.

Best regards,
InsightBoard Security Team
  `.trim();

  const sendPromise = (async () => {
    const str = [
      `From: InsightBoard <${senderEmail}>`,
      `To: ${recipientEmail}`,
      `Subject: ${messageSubject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      messageBody
    ].join('\r\n');

    const encodedMessage = Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`[Gmail API] Successfully sent OTP email to ${recipientEmail}`);
    return true;
  })();

  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn(`[Gmail API] Send timeout after 5000ms for ${recipientEmail}.`);
      resolve(false);
    }, 5000);
  });

  try {
    return await Promise.race([sendPromise, timeoutPromise]);
  } catch (err) {
    console.error('[Gmail API] Failed to send email via Gmail API:', err);
    return false;
  }
}

// Check password strength: min 8 chars, 1 number, 1 special character
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character.' };
  }
  return { valid: true };
}

// Check disposable email
function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;

  if (Array.isArray(disposableDomains) && disposableDomains.includes(domain)) return true;

  const extraList = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com'];
  return extraList.includes(domain);
}

// SIGNUP HANDLER
export async function signupHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/signup] Incoming Request Body:', {
    name: req.body?.name,
    email: req.body?.email,
    role: req.body?.role,
    passwordLength: req.body?.password ? req.body.password.length : 0
  });

  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      const err = 'All fields (name, email, password, confirmPassword) are required.';
      console.warn('[API POST /api/auth/signup] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    if (password !== confirmPassword) {
      const err = 'Password and Confirm Password do not match.';
      console.warn('[API POST /api/auth/signup] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      console.warn('[API POST /api/auth/signup] 400 Error:', passValidation.message);
      return res.status(400).json({ error: passValidation.message });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isDisposableEmail(normalizedEmail)) {
      const err = 'Signup blocked: Disposable or temporary email addresses are not permitted.';
      console.warn('[API POST /api/auth/signup] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    await getDb();

    const existing = await dbQuery<{ id: string; is_verified: number }>(
      'SELECT id, is_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length > 0 && Number(existing[0].is_verified) === 1) {
      const err = 'An account with this email address already exists.';
      console.warn('[API POST /api/auth/signup] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    // Rate-limit check
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const otpCountRes = await dbQuery<{ cnt: string | number }>(
      'SELECT COUNT(*) as cnt FROM otps WHERE email = ? AND created_at > ?',
      [normalizedEmail, new Date(tenMinsAgo).toISOString()]
    );
    const otpSendCount = Number(otpCountRes[0]?.cnt || 0);

    if (otpSendCount >= 3) {
      const err = 'Too many OTP requests. Please wait 10 minutes before requesting a new code.';
      console.warn('[API POST /api/auth/signup] 429 Error:', err);
      return res.status(429).json({ error: err });
    }

    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(password, salt);
    
    // Check if they were invited (just for logging or future logic), but everyone gets admin role
    const invites = await dbQuery<{ role: string }>('SELECT role FROM platform_invites WHERE email = ?', [normalizedEmail]);
    const userRole = 'admin'; // Everyone is an admin of their own workspace

    if (existing.length > 0 && Number(existing[0].is_verified) === 0) {
      // User exists but is unverified -> Update existing record with new details and reset timestamp
      await dbRun(
        'UPDATE users SET name = ?, password_hash = ?, role = ?, is_verified = 0, created_at = ? WHERE id = ?',
        [name.trim(), passHash, userRole, new Date().toISOString(), existing[0].id]
      );
    } else {
      // Create new unverified user record
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await dbRun(
        'INSERT INTO users (id, name, email, password_hash, role, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name.trim(), normalizedEmail, passHash, userRole, 0, new Date().toISOString()]
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_${Date.now()}`;
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await dbRun(
      'INSERT INTO otps (id, email, code, expires_at, attempts, used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [otpId, normalizedEmail, otpCode, expiresAt, 0, 0, new Date().toISOString()]
    );

    saveDb();

    const sentViaGmail = await sendOtpEmail(normalizedEmail, otpCode);

    console.log(`[API POST /api/auth/signup] 201 Success for ${normalizedEmail} (OTP: ${otpCode})`);

    const isDevMode = process.env.DEV_MODE === 'true';

    return res.status(201).json({
      message: 'Account created! Please check your email for the 6-digit OTP verification code.',
      email: normalizedEmail,
      sentViaGmail,
      devOtpCode: isDevMode ? otpCode : undefined
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/signup] 500 Error:', err);
    return res.status(500).json({ error: 'Server error during signup process.' });
  }
}

// RESEND OTP HANDLER
export async function resendOtpHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/resend-otp] Incoming Request Body:', req.body);
  try {
    const { email } = req.body;
    if (!email) {
      console.warn('[API POST /api/auth/resend-otp] 400 Error: Missing email.');
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await getDb();

    const userRes = await dbQuery('SELECT is_verified FROM users WHERE email = ?', [normalizedEmail]);
    if (userRes.length === 0) {
      console.warn('[API POST /api/auth/resend-otp] 404 Error: Account not found for ' + normalizedEmail);
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const otpCountRes = await dbQuery<{ cnt: string | number }>(
      'SELECT COUNT(*) as cnt FROM otps WHERE email = ? AND created_at > ?',
      [normalizedEmail, new Date(tenMinsAgo).toISOString()]
    );
    const otpSendCount = Number(otpCountRes[0]?.cnt || 0);

    if (otpSendCount >= 3) {
      const err = 'Too many OTP requests. Please wait 10 minutes before requesting a new code.';
      console.warn('[API POST /api/auth/resend-otp] 429 Error:', err);
      return res.status(429).json({ error: err });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_${Date.now()}`;
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await dbRun(
      'INSERT INTO otps (id, email, code, expires_at, attempts, used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [otpId, normalizedEmail, otpCode, expiresAt, 0, 0, new Date().toISOString()]
    );

    saveDb();

    const sentViaGmail = await sendOtpEmail(normalizedEmail, otpCode);

    console.log(`[API POST /api/auth/resend-otp] 200 Success for ${normalizedEmail} (New OTP: ${otpCode})`);

    const isDevMode = process.env.DEV_MODE === 'true';

    return res.status(200).json({
      message: 'A new 6-digit verification code has been sent.',
      sentViaGmail,
      devOtpCode: isDevMode ? otpCode : undefined
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/resend-otp] 500 Error:', err);
    return res.status(500).json({ error: 'Failed to resend OTP.' });
  }
}

// VERIFY OTP HANDLER
export async function verifyOtpHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/verify-otp] Incoming Request Body:', req.body);
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      const err = 'Email and 6-digit OTP code are required.';
      console.warn('[API POST /api/auth/verify-otp] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await getDb();

    const otpRes = await dbQuery<{ id: string; code: string; expires_at: number | string; attempts: number; used: number }>(
      'SELECT id, code, expires_at, attempts, used FROM otps WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [normalizedEmail]
    );

    if (otpRes.length === 0) {
      const err = 'No active OTP found. Please request a new verification code.';
      console.warn('[API POST /api/auth/verify-otp] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const otp = otpRes[0];
    const otpId = otp.id;
    const expectedCode = otp.code;
    const expiresAt = Number(otp.expires_at);
    const attempts = Number(otp.attempts);

    if (attempts >= 5) {
      await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpId]);
      saveDb();
      const err = 'This OTP has been invalidated due to 5 consecutive failed attempts. Please request a new code.';
      console.warn('[API POST /api/auth/verify-otp] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    if (Date.now() > expiresAt) {
      await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpId]);
      saveDb();
      const err = 'This verification code has expired. Please request a new code.';
      console.warn('[API POST /api/auth/verify-otp] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    if (code.trim() !== expectedCode) {
      const newAttempts = attempts + 1;
      await dbRun('UPDATE otps SET attempts = ? WHERE id = ?', [newAttempts, otpId]);
      saveDb();
      const remaining = 5 - newAttempts;
      const err = `Incorrect OTP code. You have ${remaining} attempt(s) remaining.`;
      console.warn(`[API POST /api/auth/verify-otp] 400 Mismatch Error for ${normalizedEmail}: Entered '${code.trim()}', Expected '${expectedCode}'`);
      return res.status(400).json({ error: err });
    }

    await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpId]);
    await dbRun('UPDATE users SET is_verified = 1 WHERE email = ?', [normalizedEmail]);
    saveDb();

    const userRes = await dbQuery<{ id: string; name: string; email: string; role: string; is_verified: number; created_at: string }>(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (userRes.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const row = userRes[0];
    const userObj = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as 'admin' | 'viewer',
      isVerified: true,
      createdAt: row.created_at
    };

    const token = jwt.sign({ userId: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: userObj.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const refreshHash = bcrypt.hashSync(refreshToken, 10);
    await dbRun(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [`rf_${Date.now()}`, userObj.id, refreshHash, Date.now() + 7 * 24 * 60 * 60 * 1000, new Date().toISOString()]
    );
    saveDb();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log(`[API POST /api/auth/verify-otp] 200 Success for ${normalizedEmail}`);

    return res.status(200).json({
      message: 'Email address verified successfully!',
      user: userObj,
      token
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/verify-otp] 500 Error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP code.' });
  }
}

// LOGIN HANDLER
export async function loginHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/login] Incoming Request Body:', { email: req.body?.email });
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = 'Email and password are required.';
      console.warn('[API POST /api/auth/login] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await getDb();

    const userRes = await dbQuery<{ id: string; name: string; email: string; password_hash: string; role: string; is_verified: number; created_at: string }>(
      'SELECT id, name, email, password_hash, role, is_verified, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (userRes.length === 0) {
      const err = 'Invalid credentials provided.';
      console.warn('[API POST /api/auth/login] 401 Error: User not found for ' + normalizedEmail);
      return res.status(401).json({ error: err });
    }

    const u = userRes[0];

    const match = bcrypt.compareSync(password, u.password_hash);
    if (!match) {
      const err = 'Invalid credentials provided.';
      console.warn('[API POST /api/auth/login] 401 Error: Password mismatch for ' + normalizedEmail);
      return res.status(401).json({ error: err });
    }

    if (Number(u.is_verified) === 0) {
      console.warn('[API POST /api/auth/login] 403 Error: Unverified email for ' + normalizedEmail);
      return res.status(403).json({
        error: 'Account email is not verified yet. Please enter your 6-digit OTP code to verify.',
        unverifiedEmail: u.email,
        requiresOtp: true
      });
    }

    const userObj = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as 'admin' | 'viewer',
      isVerified: true,
      createdAt: u.created_at
    };

    const token = jwt.sign({ userId: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: userObj.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const refreshHash = bcrypt.hashSync(refreshToken, 10);
    await dbRun(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [`rf_${Date.now()}`, userObj.id, refreshHash, Date.now() + 7 * 24 * 60 * 60 * 1000, new Date().toISOString()]
    );
    saveDb();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log(`[API POST /api/auth/login] 200 Success for ${normalizedEmail}`);

    return res.status(200).json({
      message: 'Logged in successfully.',
      user: userObj,
      token
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/login] 500 Error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
}

// FORGOT PASSWORD HANDLER
export async function forgotPasswordHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/forgot-password] Incoming Request Body:', req.body);
  try {
    const { email } = req.body;
    if (!email) {
      console.warn('[API POST /api/auth/forgot-password] 400 Error: Email required.');
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await getDb();

    const userRes = await dbQuery<{ id: string }>('SELECT id FROM users WHERE email = ? AND is_verified = 1', [normalizedEmail]);
    if (userRes.length === 0) {
      console.warn('[API POST /api/auth/forgot-password] 200 Info: User email not found in DB ' + normalizedEmail);
      return res.status(200).json({
        message: 'If an account exists with this email address, a password reset code has been sent.'
      });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_reset_${Date.now()}`;
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await dbRun(
      'INSERT INTO otps (id, email, code, expires_at, attempts, used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [otpId, normalizedEmail, resetOtp, expiresAt, 0, 0, new Date().toISOString()]
    );
    saveDb();

    const sentViaGmail = await sendOtpEmail(normalizedEmail, resetOtp);

    console.log(`[API POST /api/auth/forgot-password] 200 Success for ${normalizedEmail} (Reset OTP: ${resetOtp})`);

    const isDevMode = process.env.DEV_MODE === 'true';

    return res.status(200).json({
      message: 'Password reset OTP code generated.',
      sentViaGmail,
      devOtpCode: isDevMode ? resetOtp : undefined
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/forgot-password] 500 Error:', err);
    return res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
}

// RESET PASSWORD HANDLER
export async function resetPasswordHandler(req: Request, res: Response): Promise<any> {
  console.log('[API POST /api/auth/reset-password] Incoming Request Body:', {
    email: req.body?.email,
    code: req.body?.code
  });

  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      const err = 'Email, OTP code, and new password are required.';
      console.warn('[API POST /api/auth/reset-password] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.valid) {
      console.warn('[API POST /api/auth/reset-password] 400 Password Error:', passValidation.message);
      return res.status(400).json({ error: passValidation.message });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await getDb();

    const otpRes = await dbQuery<{ id: string; code: string; expires_at: number | string }>(
      'SELECT id, code, expires_at FROM otps WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [normalizedEmail]
    );

    if (otpRes.length === 0) {
      const err = 'Invalid or expired OTP code for password reset.';
      console.warn('[API POST /api/auth/reset-password] 400 Error:', err);
      return res.status(400).json({ error: err });
    }

    const otp = otpRes[0];
    const otpId = otp.id;
    const expectedCode = otp.code;
    const expiresAt = Number(otp.expires_at);

    if (Date.now() > expiresAt || code.trim() !== expectedCode) {
      const err = `Invalid or expired OTP code. Entered '${code.trim()}', Expected '${expectedCode}'`;
      console.warn('[API POST /api/auth/reset-password] 400 Code Mismatch Error:', err);
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(newPassword, salt);

    await dbRun('UPDATE users SET password_hash = ? WHERE email = ?', [passHash, normalizedEmail]);
    await dbRun('UPDATE otps SET used = 1 WHERE id = ?', [otpId]);

    const userRes = await dbQuery<{ id: string }>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (userRes.length > 0) {
      const uId = userRes[0].id;
      await dbRun('DELETE FROM refresh_tokens WHERE user_id = ?', [uId]);
    }

    saveDb();

    console.log(`[API POST /api/auth/reset-password] 200 Success for ${normalizedEmail}`);

    return res.status(200).json({
      message: 'Password reset successfully! All previous active sessions have been invalidated. Please log in with your new password.'
    });
  } catch (err: any) {
    console.error('[API POST /api/auth/reset-password] 500 Error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}

// LOGOUT ALL DEVICES HANDLER
export async function logoutAllDevicesHandler(req: Request, res: Response): Promise<any> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization token required.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await getDb();
    await dbRun('DELETE FROM refresh_tokens WHERE user_id = ?', [decoded.userId]);
    saveDb();

    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Successfully logged out from all active sessions and devices.'
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid session or token.' });
  }
}

// DELETE ACCOUNT HANDLER
export async function deleteAccountHandler(req: Request, res: Response): Promise<any> {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password re-entry is required to confirm account deletion.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await getDb();
    const userRes = await dbQuery<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', [decoded.userId]);

    if (userRes.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const currentHash = userRes[0].password_hash;
    const match = bcrypt.compareSync(password, currentHash);

    if (!match) {
      return res.status(401).json({ error: 'Incorrect password entered. Account deletion cancelled.' });
    }

    // Perform full cleanup
    await dbRun('DELETE FROM dashboards WHERE user_id = ?', [decoded.userId]);
    await dbRun('DELETE FROM data_sources WHERE user_id = ?', [decoded.userId]);
    await dbRun('DELETE FROM refresh_tokens WHERE user_id = ?', [decoded.userId]);
    await dbRun('DELETE FROM users WHERE id = ?', [decoded.userId]);
    saveDb();

    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete user account.' });
  }
}

// GET CURRENT ME USER HANDLER
export async function meHandler(req: Request, res: Response): Promise<any> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await getDb();
    const userRes = await dbQuery<{ id: string; name: string; email: string; role: string; is_verified: number; created_at: string }>(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (userRes.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const row = userRes[0];
    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as 'admin' | 'viewer',
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at
    };

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// INVITE USER HANDLER (Admin Only)
export async function inviteUserHandler(req: Request, res: Response): Promise<any> {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await getDb();
    
    // Insert or update the invite
    // Use standard SQL for UPSERT, SQLite uses ON CONFLICT DO UPDATE, Postgres also uses it
    await dbRun(
      'INSERT INTO platform_invites (email, role, invited_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET role = excluded.role, invited_at = excluded.invited_at',
      [normalizedEmail, role, new Date().toISOString()]
    );
    saveDb();

    // Send an email (using the existing gmail client)
    const senderEmail = process.env.SENDER_EMAIL || 'no-reply@insightboard.app';
    const messageLines = [
      `From: "InsightBoard BI" <${senderEmail}>`,
      `To: ${normalizedEmail}`,
      'Subject: You have been invited to InsightBoard',
      'Content-Type: text/html; charset=utf-8',
      '',
      `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">`,
      `  <h2 style="color: #4f46e5;">Welcome to InsightBoard!</h2>`,
      `  <p>An administrator has invited you to join the platform as a <strong>${role.toUpperCase()}</strong>.</p>`,
      `  <p>Click the button below to create your account and access the dashboards.</p>`,
      `  <a href="http://localhost:3000/" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Accept Invite & Signup</a>`,
      `</div>`
    ];

    const encodedMessage = Buffer.from(messageLines.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const gmail = getGmailClient();
    if (gmail) {
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });
    }

    return res.status(201).json({ message: 'Invite sent successfully.' });
  } catch (err) {
    console.error('Error inviting user:', err);
    return res.status(500).json({ error: 'Failed to send invite.' });
  }
}

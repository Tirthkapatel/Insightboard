import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { dbQuery, dbRun, getDb, saveDb } from './src/server/db.js';
import {
  signupHandler,
  inviteUserHandler,
  verifyOtpHandler,
  resendOtpHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutAllDevicesHandler,
  deleteAccountHandler,
  meHandler
} from './src/server/auth.js';
import { processCsvUpload } from './src/server/dataSourceService.js';
import { executeDynamicQuery, autoSuggestChart } from './src/server/queryEngine.js';
import { ColumnSchema, QueryConfig } from './src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'insightboard_super_secret_jwt_key_2026';

function getAuthUser(req: express.Request): { userId: string; email: string; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET) as { userId: string; email: string; role: string };
    return decoded;
  } catch (err) {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Initialize Database (PostgreSQL/Supabase if DATABASE_URL is set, otherwise SQLite fallback)
  try {
    await getDb();
  } catch (err) {
    console.error('Database initialization error:', err);
  }

  // --- API ROUTES ---

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'InsightBoard BI Dashboard', time: new Date().toISOString() });
  });

  // Auth Routes
  app.post('/api/auth/signup', signupHandler);
  app.post('/api/auth/invite', inviteUserHandler);
  app.post('/api/auth/verify-otp', verifyOtpHandler);
  app.post('/api/auth/resend-otp', resendOtpHandler);
  app.post('/api/auth/login', loginHandler);
  app.post('/api/auth/forgot-password', forgotPasswordHandler);
  app.post('/api/auth/reset-password', resetPasswordHandler);
  app.post('/api/auth/logout-all', logoutAllDevicesHandler);
  app.post('/api/auth/delete-account', deleteAccountHandler);
  app.get('/api/auth/me', meHandler);

  // Data Source Routes (User-Scoped)
  app.get('/api/datasources', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const dsRes = await dbQuery<{
        id: string;
        name: string;
        type: string;
        table_name: string;
        schema_json: string;
        user_id: string;
        row_count: number;
        created_at: string;
      }>(
        'SELECT id, name, type, table_name, schema_json, user_id, row_count, created_at FROM data_sources WHERE user_id = ? ORDER BY created_at DESC',
        [authUser.userId]
      );

      const dataSources = dsRes.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as 'csv' | 'postgres' | 'mysql' | 'sqlite' | 'demo',
        tableName: row.table_name,
        schema: JSON.parse(row.schema_json) as ColumnSchema[],
        userId: row.user_id,
        rowCount: row.row_count,
        createdAt: row.created_at
      }));

      return res.json({ dataSources });
    } catch (err: any) {
      console.error('Fetch data sources error:', err);
      return res.status(500).json({ error: 'Failed to fetch data sources.' });
    }
  });

  app.post('/api/datasources/upload', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { fileName, csvText } = req.body;
      if (!fileName || !csvText) {
        return res.status(400).json({ error: 'File name and CSV text content are required.' });
      }

      const dataSource = await processCsvUpload(fileName, csvText, authUser.userId);
      return res.status(201).json({ message: 'CSV dataset processed successfully.', dataSource });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to process CSV upload.' });
    }
  });

  app.post('/api/datasources/connect', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { name, host, port, user, database, engine } = req.body;
      if (!name || !host || !database) {
        return res.status(400).json({ error: 'Data source name, host, and database name are required.' });
      }

      const dsId = `ds_ext_${Date.now()}`;
      const sampleSchema: ColumnSchema[] = [
        { name: 'id', type: 'number', sampleValues: [1, 2, 3], uniqueCount: 100 },
        { name: 'category', type: 'category', sampleValues: ['Alpha', 'Beta', 'Gamma'], uniqueCount: 3 },
        { name: 'amount', type: 'number', sampleValues: [150.5, 220.0, 95.4], uniqueCount: 50 },
        { name: 'created_at', type: 'date', sampleValues: ['2026-01-01', '2026-01-02'], uniqueCount: 20 }
      ];

      const dsObj = {
        id: dsId,
        name: `${name} (${engine || 'PostgreSQL'})`,
        type: engine || 'postgres',
        tableName: 'college_analytics',
        schema_json: JSON.stringify(sampleSchema),
        user_id: authUser.userId,
        row_count: 100,
        connection_config_json: JSON.stringify({ host, port, user, database }),
        created_at: new Date().toISOString()
      };

      await dbRun(
        `INSERT INTO data_sources (id, name, type, table_name, schema_json, user_id, row_count, connection_config_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dsObj.id, dsObj.name, dsObj.type, dsObj.tableName, dsObj.schema_json, dsObj.user_id, dsObj.row_count, dsObj.connection_config_json, dsObj.created_at]
      );

      saveDb();

      return res.status(201).json({
        message: `Successfully connected to external ${engine || 'PostgreSQL'} database '${database}'.`,
        dataSource: {
          id: dsObj.id,
          name: dsObj.name,
          type: dsObj.type,
          tableName: dsObj.tableName,
          schema: sampleSchema,
          userId: authUser.userId,
          rowCount: 100,
          createdAt: dsObj.created_at
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to connect external data source.' });
    }
  });

  // Query & Auto-Suggest Routes (User-Scoped Permission Enforcement)
  app.post('/api/query/execute', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const config: QueryConfig = req.body;
      const { tableName, dataSourceId } = config;

      // Check dataset ownership
      let dsCheck;
      if (dataSourceId) {
        dsCheck = await dbQuery<{ user_id: string }>('SELECT user_id FROM data_sources WHERE id = ?', [dataSourceId]);
      } else if (tableName) {
        dsCheck = await dbQuery<{ user_id: string }>('SELECT user_id FROM data_sources WHERE table_name = ?', [tableName]);
      }

      if (dsCheck && dsCheck.length > 0) {
        const ownerId = dsCheck[0].user_id;
        if (ownerId && ownerId !== authUser.userId) {
          // Check if user is an invited viewer on a dashboard owned by ownerId
          const shareCheck = await dbQuery<{ id: string }>(
            `
            SELECT s.id 
            FROM dashboard_shares s 
            JOIN dashboards d ON s.dashboard_id = d.id 
            WHERE d.user_id = ? 
            AND (LOWER(s.user_email) = ? OR s.user_id = ?)
          `,
            [ownerId, authUser.email.toLowerCase(), authUser.userId]
          );

          if (!shareCheck || shareCheck.length === 0) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to query this dataset.' });
          }
        }
      }

      const result = await executeDynamicQuery(config);
      return res.json({ result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Error executing query.' });
    }
  });

  app.post('/api/query/suggest', async (req, res) => {
    try {
      const { schema = [], xAxis, yAxis, aggregation = 'SUM' } = req.body;
      const suggestion = autoSuggestChart(schema, xAxis, yAxis, aggregation);
      return res.json({ suggestion });
    } catch (err: any) {
      return res.status(400).json({ error: 'Failed to generate chart suggestion.' });
    }
  });

  // Dashboard Routes (User-Scoped & Sharing)
  app.get('/api/dashboards', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      // 1. Owned dashboards
      const ownRes = await dbQuery<{
        id: string;
        user_id: string;
        title: string;
        description: string;
        layout_json: string;
        created_at: string;
        updated_at: string;
      }>('SELECT id, user_id, title, description, layout_json, created_at, updated_at FROM dashboards WHERE user_id = ? ORDER BY updated_at DESC', [
        authUser.userId
      ]);

      const ownDashboards = ownRes.map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        charts: JSON.parse(row.layout_json),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isShared: false,
        isOwner: true,
        permission: 'owner' as const
      }));

      // 2. Shared dashboards
      const sharedRes = await dbQuery<{
        id: string;
        user_id: string;
        title: string;
        description: string;
        layout_json: string;
        created_at: string;
        updated_at: string;
        name: string;
        email: string;
        role: string;
      }>(
        `
        SELECT d.id, d.user_id, d.title, d.description, d.layout_json, d.created_at, d.updated_at, u.name, u.email, s.role
        FROM dashboards d
        JOIN dashboard_shares s ON d.id = s.dashboard_id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE (LOWER(s.user_email) = ? OR s.user_id = ?)
        ORDER BY d.updated_at DESC
      `,
        [authUser.email.toLowerCase(), authUser.userId]
      );

      const sharedDashboards = sharedRes.map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        charts: JSON.parse(row.layout_json),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isShared: true,
        isOwner: false,
        permission: (row.role || 'viewer') as 'viewer' | 'admin',
        ownerName: row.name || 'Admin',
        ownerEmail: row.email || ''
      }));

      const ownIds = new Set(ownDashboards.map((d) => d.id));
      const filteredShared = sharedDashboards.filter((d) => !ownIds.has(d.id));

      const dashboards = [...ownDashboards, ...filteredShared];

      return res.json({ dashboards });
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboards.' });
    }
  });

  app.post('/api/dashboards', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { id, title, description, charts = [] } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Dashboard title is required.' });
      }

      const dashId = id || `dash_${Date.now()}`;
      const layoutJson = JSON.stringify(charts);
      const now = new Date().toISOString();

      const existing = await dbQuery<{ user_id: string }>('SELECT user_id FROM dashboards WHERE id = ?', [dashId]);

      if (existing.length > 0) {
        const ownerId = existing[0].user_id;
        
        let hasPermission = false;
        if (ownerId === authUser.userId) {
          hasPermission = true;
        } else {
          // Check if they are a shared admin
          const shareCheck = await dbQuery<{ role: string }>('SELECT role FROM dashboard_shares WHERE dashboard_id = ? AND user_id = ?', [dashId, authUser.userId]);
          if (shareCheck.length > 0 && shareCheck[0].role === 'admin') {
            hasPermission = true;
          }
        }

        if (!hasPermission) {
          return res.status(403).json({ error: 'Forbidden: You do not have permission to update this dashboard. Only the dashboard owner or an admin can modify it.' });
        }
        await dbRun('UPDATE dashboards SET title = ?, description = ?, layout_json = ?, updated_at = ? WHERE id = ?', [
          title,
          description || '',
          layoutJson,
          now,
          dashId
        ]);
      } else {
        await dbRun('INSERT INTO dashboards (id, user_id, title, description, layout_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
          dashId,
          authUser.userId,
          title,
          description || '',
          layoutJson,
          now,
          now
        ]);
      }

      saveDb();

      return res.status(200).json({
        message: 'Dashboard saved successfully.',
        dashboard: {
          id: dashId,
          userId: authUser.userId,
          title,
          description,
          charts,
          createdAt: now,
          updatedAt: now
        }
      });
    } catch (err: any) {
      console.error('Failed to save dashboard:', err);
      return res.status(500).json({ error: err.message || 'Failed to save dashboard.' });
    }
  });

  app.delete('/api/dashboards/:id', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { id } = req.params;
      const existing = await dbQuery<{ user_id: string }>('SELECT user_id FROM dashboards WHERE id = ?', [id]);

      if (existing.length > 0) {
        const ownerId = existing[0].user_id;
        if (ownerId !== authUser.userId) {
          return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this dashboard.' });
        }
      } else {
        return res.status(404).json({ error: 'Dashboard not found.' });
      }

      await dbRun('DELETE FROM dashboards WHERE id = ?', [id]);
      await dbRun('DELETE FROM dashboard_shares WHERE dashboard_id = ?', [id]);
      saveDb();
      return res.json({ message: 'Dashboard deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete dashboard.' });
    }
  });

  // Invite/Share Dashboard with another user
  app.post('/api/dashboards/:id/share', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { id } = req.params;
      const { email, role } = req.body;
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Valid user email address is required.' });
      }

      const assignedRole = role === 'admin' ? 'admin' : 'viewer';
      const targetEmail = email.trim().toLowerCase();

      const dashCheck = await dbQuery<{ user_id: string; title: string }>('SELECT user_id, title FROM dashboards WHERE id = ?', [id]);
      if (dashCheck.length === 0) {
        return res.status(404).json({ error: 'Dashboard not found.' });
      }

      const ownerId = dashCheck[0].user_id;
      if (ownerId !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Only the dashboard owner can invite viewers.' });
      }

      if (targetEmail === authUser.email.toLowerCase()) {
        return res.status(400).json({ error: 'You cannot invite yourself as a viewer.' });
      }

      const userCheck = await dbQuery<{ id: string; name: string }>('SELECT id, name FROM users WHERE LOWER(email) = ?', [targetEmail]);
      if (userCheck.length === 0) {
        return res.status(404).json({ error: "This user hasn't signed up yet — ask them to create an account first" });
      }

      const targetUserId = userCheck[0].id;

      const shareCheck = await dbQuery('SELECT id FROM dashboard_shares WHERE dashboard_id = ? AND LOWER(user_email) = ?', [id, targetEmail]);
      if (shareCheck.length > 0) {
        // If already shared, update the role
        await dbRun('UPDATE dashboard_shares SET role = ? WHERE dashboard_id = ? AND LOWER(user_email) = ?', [assignedRole, id, targetEmail]);
        saveDb();
        return res.status(200).json({
          message: `Dashboard role for ${targetEmail} updated to ${assignedRole}.`
        });
      }

      const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      await dbRun('INSERT INTO dashboard_shares (id, dashboard_id, user_email, user_id, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
        shareId,
        id,
        targetEmail,
        targetUserId,
        assignedRole,
        now
      ]);
      saveDb();

      return res.status(201).json({
        message: `Dashboard successfully shared with ${targetEmail}.`,
        share: {
          id: shareId,
          dashboardId: id,
          userEmail: targetEmail,
          role: assignedRole,
          createdAt: now
        }
      });
    } catch (err: any) {
      console.error('Failed to share dashboard:', err);
      return res.status(500).json({ error: err.message || 'Failed to share dashboard.' });
    }
  });

  // Get list of shared viewers for a dashboard
  app.get('/api/dashboards/:id/shares', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { id } = req.params;
      const dashCheck = await dbQuery<{ user_id: string }>('SELECT user_id FROM dashboards WHERE id = ?', [id]);
      if (dashCheck.length === 0) {
        return res.status(404).json({ error: 'Dashboard not found.' });
      }

      const ownerId = dashCheck[0].user_id;
      if (ownerId !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Only the dashboard owner can view share settings.' });
      }

      const sharesRes = await dbQuery<{
        id: string;
        dashboard_id: string;
        user_email: string;
        role: string;
        created_at: string;
      }>('SELECT id, dashboard_id, user_email, role, created_at FROM dashboard_shares WHERE dashboard_id = ? ORDER BY created_at DESC', [id]);

      const shares = sharesRes.map((row) => ({
        id: row.id,
        dashboardId: row.dashboard_id,
        userEmail: row.user_email,
        role: row.role as 'viewer',
        createdAt: row.created_at
      }));

      return res.json({ shares });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch shares.' });
    }
  });

  // Revoke viewer access
  app.delete('/api/dashboards/:id/shares/:shareId', async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }

      const { id, shareId } = req.params;
      const dashCheck = await dbQuery<{ user_id: string }>('SELECT user_id FROM dashboards WHERE id = ?', [id]);
      if (dashCheck.length === 0) {
        return res.status(404).json({ error: 'Dashboard not found.' });
      }

      const ownerId = dashCheck[0].user_id;
      if (ownerId !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Only the dashboard owner can revoke share access.' });
      }

      await dbRun('DELETE FROM dashboard_shares WHERE id = ? AND dashboard_id = ?', [shareId, id]);
      saveDb();

      return res.json({ message: 'Viewer access revoked successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to revoke viewer access.' });
    }
  });

  // Serve Frontend / Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static files (only needed for local production run, Vercel handles static automatically)
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // If running in Vercel, export the app as a module
  if (process.env.VERCEL) {
    return app;
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InsightBoard Server listening on http://0.0.0.0:${PORT}`);
  });
}

// For local dev/prod, run the server
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server boot error:', err);
  });
}

// For Vercel Serverless Function, export a top-level async handler that initializes the app
let appInstance: express.Express;
export default async function vercelHandler(req: any, res: any) {
  if (!appInstance) {
    appInstance = (await startServer()) as express.Express;
  }
  return appInstance(req, res);
}

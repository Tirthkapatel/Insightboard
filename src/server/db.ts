import dotenv from 'dotenv';
dotenv.config({ override: true });
import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

let pgPool: pg.Pool | null = null;
let sqliteInstance: Database | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'insightboard.sqlite');

let activeMode: 'postgres' | 'sqlite' = 'sqlite';

export function getDbMode(): 'postgres' | 'sqlite' {
  return activeMode;
}

function formatPgConnectionString(rawUrl: string): string {
  let url = rawUrl.trim();
  // Match postgresql://user:pass@host:port/db
  const match = url.match(/^(postgres(?:ql)?:\/\/)([^:]+):(.*)@([^@\/]+:[0-9]+\/.*)$/);
  if (match) {
    const [, proto, user, rawPassAndExtra, hostPortDb] = match;
    let pass = rawPassAndExtra;
    if (pass.startsWith('[') && pass.endsWith(']')) {
      pass = pass.slice(1, -1);
    }
    if (!pass.includes('%')) {
      pass = encodeURIComponent(pass);
    }
    return `${proto}${user}:${pass}@${hostPortDb}`;
  }
  return url;
}

function getPgPool(): pg.Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pgPool) {
    const connectionString = formatPgConnectionString(process.env.DATABASE_URL);
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pgPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }
  return pgPool;
}

function translateSqlToPg(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

function translateSqlToSqlite(sql: string): string {
  return sql.replace(/\$\d+/g, '?');
}

export async function dbQuery<T = Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
  const mode = getDbMode();

  if (mode === 'postgres') {
    const pool = getPgPool();
    if (!pool) throw new Error('PostgreSQL database pool not initialized.');
    const pgSql = translateSqlToPg(sql);
    const res = await pool.query(pgSql, params);
    return res.rows as T[];
  } else {
    const db = await getSqliteDb();
    const sqliteSql = translateSqlToSqlite(sql);
    const stmt = db.prepare(sqliteSql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  }
}

export async function dbRun(sql: string, params: any[] = []): Promise<void> {
  const mode = getDbMode();

  if (mode === 'postgres') {
    const pool = getPgPool();
    if (!pool) throw new Error('PostgreSQL database pool not initialized.');
    const pgSql = translateSqlToPg(sql);
    await pool.query(pgSql, params);
  } else {
    const db = await getSqliteDb();
    const sqliteSql = translateSqlToSqlite(sql);
    db.run(sqliteSql, params);
    saveDb();
  }
}

async function getSqliteDb(): Promise<Database> {
  if (sqliteInstance) return sqliteInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      sqliteInstance = new SQL.Database(fileBuffer);
      sqliteInstance.exec('PRAGMA quick_check;');
    } catch (err) {
      console.error('SQLite DB file corrupted. Recreating clean database:', err);
      if (fs.existsSync(DB_FILE)) {
        try { fs.unlinkSync(DB_FILE); } catch (_) {}
      }
      sqliteInstance = new SQL.Database();
    }
  } else {
    sqliteInstance = new SQL.Database();
  }

  saveDb();
  return sqliteInstance;
}

export async function getDb(): Promise<{
  mode: 'postgres' | 'sqlite';
  exec: (sql: string) => Array<{ columns: string[]; values: any[][] }>;
  run: (sql: string, params?: any[]) => void;
  query: <T = Record<string, any>>(sql: string, params?: any[]) => Promise<T[]>;
}> {
  const mode = getDbMode();
  await initTables();

  return {
    mode,
    query: dbQuery,
    run: (sql: string, params: any[] = []) => {
      dbRun(sql, params).catch((err) => console.error('dbRun background error:', err));
    },
    exec: (sql: string) => {
      if (mode === 'sqlite' && sqliteInstance) {
        return sqliteInstance.exec(sql);
      }
      return [];
    }
  };
}

export function saveDb() {
  if (getDbMode() === 'postgres' || !sqliteInstance) return;
  try {
    const data = sqliteInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite DB to file:', err);
  }
}

let tablesInitialized = false;

export async function initTables() {
  if (tablesInitialized) return;

  if (process.env.DATABASE_URL) {
    try {
      const pool = getPgPool();
      if (pool) {
        await pool.query('SELECT 1');
        activeMode = 'postgres';
        console.log('[Database Initialization] Successfully connected to PostgreSQL / Supabase instance.');
      }
    } catch (err: any) {
      console.warn('[Database Initialization Warning] Could not connect to PostgreSQL / Supabase:', err.message);
      console.warn('[Database Initialization Warning] Falling back to local embedded SQLite database.');
      activeMode = 'sqlite';
    }
  } else {
    activeMode = 'sqlite';
  }

  const mode = getDbMode();
  console.log(`[Database Initialization] Connected Mode: ${mode.toUpperCase()} ${mode === 'postgres' ? '(Supabase / Managed PostgreSQL)' : '(Local SQLite)'}`);

  // Create tables using standard Postgres & SQLite compatible DDL
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at VARCHAR(255) NOT NULL
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS otps (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(20) NOT NULL,
      expires_at BIGINT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used INTEGER NOT NULL DEFAULT 0,
      created_at VARCHAR(255) NOT NULL
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at VARCHAR(255) NOT NULL
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      table_name VARCHAR(255) NOT NULL,
      schema_json TEXT NOT NULL,
      user_id VARCHAR(255),
      row_count INTEGER NOT NULL DEFAULT 0,
      connection_config_json TEXT,
      created_at VARCHAR(255) NOT NULL
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS dashboards (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      layout_json TEXT NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      updated_at VARCHAR(255) NOT NULL
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS dashboard_shares (
      id VARCHAR(255) PRIMARY KEY,
      dashboard_id VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'viewer',
      created_at VARCHAR(255) NOT NULL,
      FOREIGN KEY (dashboard_id) REFERENCES dashboards (id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS platform_invites (
      email TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      invited_at TEXT NOT NULL
    );
  `);

  if (mode === 'postgres') {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS college_analytics (
        student_id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        attendance_percentage DOUBLE PRECISION NOT NULL,
        marks DOUBLE PRECISION NOT NULL,
        placement_status VARCHAR(50) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        graduation_year INTEGER NOT NULL
      );
    `);
  } else {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS college_analytics (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        department TEXT NOT NULL,
        semester TEXT NOT NULL,
        attendance_percentage REAL NOT NULL,
        marks REAL NOT NULL,
        placement_status TEXT NOT NULL,
        gender TEXT NOT NULL,
        graduation_year INTEGER NOT NULL
      );
    `);
  }

  // Pre-seed Custom Admin User
  const users = await dbQuery<{ cnt: string | number }>("SELECT COUNT(*) as cnt FROM users WHERE email = 'admin@tirth.com'");
  const userCount = Number(users[0]?.cnt || 0);

  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    // Secure password for Tirth
    const passHash = bcrypt.hashSync('Tirth@2026Insight', salt);
    await dbRun(
      `INSERT INTO users (id, name, email, password_hash, role, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['usr_admin_tirth', 'Tirth Kapatel', 'admin@tirth.com', passHash, 'admin', 1, new Date().toISOString()]
    );
  }

  // Pre-seed College Analytics Demo Dataset
  const analyticsRows = await dbQuery<{ cnt: string | number }>('SELECT COUNT(*) as cnt FROM college_analytics');
  const recordCount = Number(analyticsRows[0]?.cnt || 0);

  if (recordCount === 0) {
    await seedCollegeAnalytics();
  }

  // Register college_analytics data source if missing
  const dsCheck = await dbQuery<{ cnt: string | number }>("SELECT COUNT(*) as cnt FROM data_sources WHERE id = 'ds_college_analytics'");
  const dsCount = Number(dsCheck[0]?.cnt || 0);

  if (dsCount === 0) {
    const collegeSchema = [
      { name: 'student_id', type: 'number', sampleValues: [1, 2, 3], uniqueCount: 100 },
      { name: 'student_name', type: 'text', sampleValues: ['Aarav Sharma', 'Ananya Patel'], uniqueCount: 100 },
      { name: 'department', type: 'category', sampleValues: ['Computer Science', 'Data Science', 'Electronics'], uniqueCount: 5 },
      { name: 'semester', type: 'category', sampleValues: ['Sem 1', 'Sem 4', 'Sem 6', 'Sem 8'], uniqueCount: 8 },
      { name: 'attendance_percentage', type: 'number', sampleValues: [85.5, 92.0, 78.4], uniqueCount: 80 },
      { name: 'marks', type: 'number', sampleValues: [88.5, 94.0, 65.2], uniqueCount: 85 },
      { name: 'placement_status', type: 'category', sampleValues: ['Placed', 'Unplaced', 'Higher Studies'], uniqueCount: 3 },
      { name: 'gender', type: 'category', sampleValues: ['Male', 'Female', 'Non-Binary'], uniqueCount: 3 },
      { name: 'graduation_year', type: 'number', sampleValues: [2024, 2025, 2026], uniqueCount: 3 }
    ];

    await dbRun(
      `INSERT INTO data_sources (id, name, type, table_name, schema_json, user_id, row_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ds_college_analytics',
        'College Student Analytics (Demo Dataset)',
        'demo',
        'college_analytics',
        JSON.stringify(collegeSchema),
        'usr_admin_tirth',
        105,
        new Date().toISOString()
      ]
    );
  }

  // Seed default dashboard
  const dashCheck = await dbQuery<{ cnt: string | number }>('SELECT COUNT(*) as cnt FROM dashboards');
  const dashCount = Number(dashCheck[0]?.cnt || 0);

  if (dashCount === 0) {
    const sampleDashboard = {
      id: 'dash_default_1',
      user_id: 'usr_admin_tirth',
      title: 'College Academic & Placement Overview',
      description: 'Key performance indicators for student marks, attendance, department metrics, and placement rates.',
      layout_json: JSON.stringify([
        {
          id: 'chart_1',
          title: 'Average Marks by Department',
          gridSpan: 'half',
          queryConfig: {
            dataSourceId: 'ds_college_analytics',
            tableName: 'college_analytics',
            xAxis: 'department',
            yAxis: 'marks',
            aggregation: 'AVG',
            filters: [],
            chartType: 'bar',
            sortOrder: 'DESC',
            limit: 10
          }
        },
        {
          id: 'chart_2',
          title: 'Placement Distribution',
          gridSpan: 'half',
          queryConfig: {
            dataSourceId: 'ds_college_analytics',
            tableName: 'college_analytics',
            xAxis: 'placement_status',
            yAxis: 'student_id',
            aggregation: 'COUNT',
            filters: [],
            chartType: 'pie',
            limit: 10
          }
        },
        {
          id: 'chart_3',
          title: 'Attendance Trend across Semesters',
          gridSpan: 'half',
          queryConfig: {
            dataSourceId: 'ds_college_analytics',
            tableName: 'college_analytics',
            xAxis: 'semester',
            yAxis: 'attendance_percentage',
            aggregation: 'AVG',
            filters: [],
            chartType: 'line',
            limit: 10
          }
        },
        {
          id: 'chart_4',
          title: 'Highest Marks by Department',
          gridSpan: 'half',
          queryConfig: {
            dataSourceId: 'ds_college_analytics',
            tableName: 'college_analytics',
            xAxis: 'department',
            yAxis: 'marks',
            aggregation: 'MAX',
            filters: [],
            chartType: 'bar',
            limit: 10
          }
        }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await dbRun(
      `INSERT INTO dashboards (id, user_id, title, description, layout_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sampleDashboard.id,
        sampleDashboard.user_id,
        sampleDashboard.title,
        sampleDashboard.description,
        sampleDashboard.layout_json,
        sampleDashboard.created_at,
        sampleDashboard.updated_at
      ]
    );
  }
  tablesInitialized = true;
}

async function seedCollegeAnalytics() {
  const firstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Aditya', 'Sneha', 'Kabir', 'Diya',
    'Arjun', 'Isha', 'Dev', 'Kavya', 'Siddharth', 'Meera', 'Rahul', 'Riya', 'Karan', 'Tanvi',
    'Yash', 'Pooja', 'Amit', 'Shreya', 'Manish', 'Nisha', 'Aakash', 'Swati', 'Varun', 'Tarun'
  ];

  const lastNames = [
    'Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Joshi', 'Rao', 'Nair', 'Kumar',
    'Chopra', 'Malhotra', 'Bhasin', 'Deshmukh', 'Mehta', 'Shah', 'Iyer', 'Chatterjee', 'Banerjee', 'Bhat'
  ];

  const departments = ['Computer Science', 'Data Science', 'Electronics', 'Mechanical', 'Civil'];
  const semesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
  const placements = ['Placed', 'Unplaced', 'Higher Studies'];
  const genders = ['Male', 'Female', 'Non-Binary'];
  const years = [2024, 2025, 2026];

  for (let i = 1; i <= 105; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const studentName = `${fn} ${ln}`;
    const dept = departments[i % departments.length];
    const sem = semesters[i % semesters.length];

    const attendance = parseFloat((60 + (i * 7.3) % 38.5).toFixed(1));
    const marks = parseFloat((52 + (i * 11.7) % 47.0).toFixed(1));

    let placement = placements[i % placements.length];
    if (marks > 85) placement = 'Placed';
    else if (marks < 62) placement = 'Unplaced';

    const gender = genders[i % genders.length];
    const gradYear = years[i % years.length];

    await dbRun(
      `INSERT INTO college_analytics (student_name, department, semester, attendance_percentage, marks, placement_status, gender, graduation_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentName, dept, sem, attendance, marks, placement, gender, gradYear]
    );
  }
}


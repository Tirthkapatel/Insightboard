import Papa from 'papaparse';
import { dbRun, getDb, getDbMode, saveDb } from './db.js';
import { ColumnSchema, DataSource } from '../types.js';

export async function processCsvUpload(
  fileName: string,
  csvText: string,
  userId: string
): Promise<DataSource> {
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
    throw new Error(`Failed to parse CSV file: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data as Record<string, any>[];
  if (rows.length === 0) {
    throw new Error('The uploaded CSV file is empty.');
  }

  const headers = Object.keys(rows[0]).map((h) => h.trim());
  if (headers.length === 0) {
    throw new Error('CSV file contains no valid column headers.');
  }

  // Sanitize table name
  const safeBaseName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
  const tableName = `ds_${safeBaseName}_${Date.now().toString().substring(7)}`;

  // Detect column schema and types
  const columnSchemas: ColumnSchema[] = [];
  const colSqlTypes: Record<string, string> = {};

  for (const header of headers) {
    const cleanCol = header.replace(/[^a-zA-Z0-9_]/g, '_');
    const values = rows.map((r) => r[header]).filter((v) => v !== undefined && v !== null && v !== '');

    let type: ColumnSchema['type'] = 'text';
    let sqlType = 'TEXT';

    if (values.length > 0) {
      const isAllNum = values.every((v) => !isNaN(Number(v)));
      if (isAllNum) {
        type = 'number';
        sqlType = 'DOUBLE PRECISION';
      } else {
        const isDate = values.slice(0, 10).every((v) => !isNaN(Date.parse(String(v))));
        if (isDate) {
          type = 'date';
          sqlType = 'VARCHAR(255)';
        } else {
          const uniqueVals = new Set(values);
          if (uniqueVals.size <= 15) {
            type = 'category';
            sqlType = 'VARCHAR(255)';
          } else {
            type = 'text';
            sqlType = 'TEXT';
          }
        }
      }
    }

    const uniqueVals = Array.from(new Set(values));
    columnSchemas.push({
      name: cleanCol,
      type,
      sampleValues: uniqueVals.slice(0, 3),
      uniqueCount: uniqueVals.length
    });

    colSqlTypes[cleanCol] = sqlType;
  }

  await getDb();

  const isPg = getDbMode() === 'postgres';
  const primaryKeyDef = isPg ? 'id SERIAL PRIMARY KEY' : 'id INTEGER PRIMARY KEY AUTOINCREMENT';

  // Create dynamic dataset table
  const columnDefs = columnSchemas.map((c) => `"${c.name}" ${colSqlTypes[c.name]}`).join(', ');
  const createSql = `CREATE TABLE "${tableName}" (${primaryKeyDef}, ${columnDefs});`;
  await dbRun(createSql);

  // Insert rows
  const colNames = columnSchemas.map((c) => `"${c.name}"`).join(', ');
  const placeholders = columnSchemas.map(() => '?').join(', ');
  const insertSql = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders});`;

  for (const row of rows) {
    const vals = columnSchemas.map((c) => {
      const origHeader = headers.find((h) => h.replace(/[^a-zA-Z0-9_]/g, '_') === c.name) || c.name;
      const raw = row[origHeader];
      if (c.type === 'number') {
        const n = Number(raw);
        return isNaN(n) ? null : n;
      }
      return raw !== undefined && raw !== null ? String(raw) : null;
    });

    await dbRun(insertSql, vals);
  }

  // Register in data_sources
  const dsId = `ds_${Date.now()}`;
  const cleanDsName = fileName.replace(/\.[^/.]+$/, '');

  const dataSourceObj: DataSource = {
    id: dsId,
    name: cleanDsName,
    type: 'csv',
    tableName,
    schema: columnSchemas,
    userId,
    rowCount: rows.length,
    createdAt: new Date().toISOString()
  };

  await dbRun(
    `INSERT INTO data_sources (id, name, type, table_name, schema_json, user_id, row_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dataSourceObj.id,
      dataSourceObj.name,
      dataSourceObj.type,
      dataSourceObj.tableName,
      JSON.stringify(dataSourceObj.schema),
      dataSourceObj.userId,
      dataSourceObj.rowCount,
      dataSourceObj.createdAt
    ]
  );

  saveDb();

  return dataSourceObj;
}


import { dbQuery, getDb } from './db.js';
import { QueryConfig, QueryResult, ChartSuggestion, ColumnSchema } from '../types.js';


/**
 * AUTO-CHART SUGGESTION ALGORITHM
 * Analyzes selected dataset fields and column data types to recommend
 * the most effective visualization type (Line, Bar, Pie, or Table).
 *
 * Logic:
 * 1. Line Chart: Best for time-series or sequential data (dates, semesters, years).
 * 2. Pie Chart: Best for small categorical fields (<= 6 distinct values) showing proportions.
 * 3. Bar Chart: Best for comparing discrete categories or groups.
 * 4. Data Table: Fallback for raw unaggregated rows or complex multi-field listings.
 */
export function autoSuggestChart(
  schema: ColumnSchema[],
  xAxis: string,
  yAxis: string,
  aggregation: string
): ChartSuggestion {
  const xCol = schema.find((c) => c.name === xAxis);

  if (!xCol) {
    return {
      recommendedType: 'bar',
      confidence: 'medium',
      reason: 'Default bar chart recommended for general comparisons.'
    };
  }

  const nameLower = xAxis.toLowerCase();
  const isTimeOrSequence =
    xCol.type === 'date' ||
    nameLower.includes('date') ||
    nameLower.includes('year') ||
    nameLower.includes('month') ||
    nameLower.includes('semester') ||
    nameLower.includes('time') ||
    nameLower.includes('period') ||
    nameLower.includes('day') ||
    nameLower.includes('quarter');

  // Rule 1: Time or Sequential field on X-axis -> Line Chart
  if (isTimeOrSequence) {
    return {
      recommendedType: 'line',
      confidence: 'high',
      reason: `The field '${xAxis}' represents time or sequential data. Line charts are optimal for displaying continuous trends.`
    };
  }

  // Rule 2: Low-cardinality categorical field (<= 6 unique values) -> Pie Chart
  if (xCol.uniqueCount <= 6 || xCol.type === 'category') {
    if (xCol.uniqueCount <= 6 && xCol.uniqueCount > 1) {
      return {
        recommendedType: 'pie',
        confidence: 'high',
        reason: `The field '${xAxis}' has ${xCol.uniqueCount} distinct categories. Pie charts effectively highlight proportional composition.`
      };
    }
  }

  // Rule 3: Discrete categories with multiple values -> Bar Chart
  if (xCol.type === 'category' || xCol.type === 'text') {
    return {
      recommendedType: 'bar',
      confidence: 'high',
      reason: `The field '${xAxis}' contains discrete categorical values. Bar charts provide high visual clarity for group comparisons.`
    };
  }

  // Fallback -> Bar Chart
  return {
    recommendedType: 'bar',
    confidence: 'medium',
    reason: `Numeric or metric field on X-axis. Bar chart recommended for binned distribution.`
  };
}

/**
 * SQL QUERY GENERATOR
 * Dynamically constructs safe SQL statements from visual query configuration options.
 */
export async function executeDynamicQuery(config: QueryConfig): Promise<QueryResult> {
  const startTime = Date.now();
  const db = await getDb();

  const { tableName, xAxis, yAxis, aggregation, filters = [], limit = 50, sortOrder = 'DESC' } = config;

  if (!tableName || !xAxis || !yAxis) {
    throw new Error('Table name, X-axis, and Y-axis are required to execute a query.');
  }

  // Clean and sanitize identifiers
  const cleanTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  const cleanX = xAxis.replace(/[^a-zA-Z0-9_]/g, '');
  const cleanY = yAxis.replace(/[^a-zA-Z0-9_]/g, '');

  let sql = '';
  const params: (string | number)[] = [];

  // Build WHERE clause
  const whereClauses: string[] = [];
  for (const filter of filters) {
    if (filter.column && filter.operator && filter.value !== undefined && filter.value !== '') {
      const cleanCol = filter.column.replace(/[^a-zA-Z0-9_]/g, '');
      const validOps = ['=', '!=', '>', '<', '>=', '<=', 'LIKE'];
      const op = validOps.includes(filter.operator) ? filter.operator : '=';

      whereClauses.push(`${cleanCol} ${op} ?`);
      if (op === 'LIKE') {
        params.push(`%${filter.value}%`);
      } else {
        params.push(filter.value);
      }
    }
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Handle Aggregation SQL construction
  const aggUpper = (aggregation || 'SUM').toUpperCase();
  const validAggs = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];
  const safeAgg = validAggs.includes(aggUpper) ? aggUpper : 'SUM';

  const limitVal = Math.min(Math.max(1, limit || 50), 500);
  const safeSort = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  sql = `
    SELECT 
      ${cleanX} AS "${cleanX}", 
      ${safeAgg}(${cleanY}) AS "${safeAgg}_of_${cleanY}"
    FROM ${cleanTable}
    ${whereSql}
    GROUP BY ${cleanX}
    ORDER BY "${safeAgg}_of_${cleanY}" ${safeSort}
    LIMIT ${limitVal}
  `.trim();

  try {
    const rawRows = await dbQuery<Record<string, any>>(sql, params);

    const rows: Record<string, any>[] = [];
    const columns: string[] = rawRows.length > 0 ? Object.keys(rawRows[0]) : [cleanX, `${safeAgg}_of_${cleanY}`];

    for (const r of rawRows) {
      const rowObj: Record<string, any> = { ...r };
      for (const key in rowObj) {
        const val = rowObj[key];
        if (val !== null && val !== undefined && !isNaN(Number(val))) {
          const num = Number(val);
          rowObj[key] = Number.isInteger(num) ? num : Math.round(num * 100) / 100;
        }
      }
      rows.push(rowObj);
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      columns,
      rows,
      sql: sql.replace(/\s+/g, ' '),
      executionTimeMs,
      rowCount: rows.length
    };
  } catch (err: any) {
    console.error('SQL Execution Error:', err, 'SQL Statement:', sql);
    throw new Error(`Failed to execute query: ${err.message || err}`);
  }
}

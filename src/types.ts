export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export type ColumnDataType = 'date' | 'number' | 'category' | 'text';

export interface ColumnSchema {
  name: string;
  type: ColumnDataType;
  sampleValues: (string | number)[];
  uniqueCount: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'postgres' | 'mysql' | 'sqlite' | 'demo';
  tableName: string;
  schema: ColumnSchema[];
  userId?: string;
  rowCount: number;
  createdAt: string;
  connectionConfig?: {
    host?: string;
    port?: number;
    user?: string;
    database?: string;
  };
}

export type AggregationFunction = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN';
export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'table';

export interface QueryConfig {
  dataSourceId: string;
  tableName: string;
  xAxis: string;
  yAxis: string;
  aggregation: AggregationFunction;
  filters: FilterCondition[];
  chartType: ChartType;
  limit?: number;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ChartSuggestion {
  recommendedType: ChartType;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface DashboardChart {
  id: string;
  title: string;
  queryConfig: QueryConfig;
  gridSpan?: 'full' | 'half';
}

export interface DashboardShare {
  id: string;
  dashboardId: string;
  userEmail: string;
  role: 'viewer' | 'admin';
  createdAt: string;
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  charts: DashboardChart[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  isShared?: boolean;
  isOwner?: boolean;
  permission?: 'owner' | 'viewer';
  ownerName?: string;
  ownerEmail?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  sql: string;
  executionTimeMs: number;
  rowCount: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

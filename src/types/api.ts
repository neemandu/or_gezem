// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Settlement entity (matches database schema)
export interface Settlement extends BaseEntity {
  name: string;
  contact_person?: string;
  contact_phone?: string;
}

export type CreateSettlementRequest = Omit<
  Settlement,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateSettlementRequest = Partial<CreateSettlementRequest>;

// Driver entity (matches users table with role='DRIVER' + metadata)
export interface Driver extends BaseEntity {
  email: string;
  role: 'DRIVER';
  first_name?: string;
  last_name?: string;
  // Additional fields stored in user_metadata
  user_metadata?: {
    name?: string;
    phone?: string;
    license_number?: string;
    first_name?: string;
    last_name?: string;
    hire_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
  };
}

export type CreateDriverRequest = {
  email: string;
  password?: string; // Optional - auto-generated if not provided
  first_name?: string;
  last_name?: string;
  phone?: string;
  license_number?: string;
  hire_date?: string;
  active?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
};

export type UpdateDriverRequest = Partial<CreateDriverRequest>;

// Container Type entity (what was previously called Tank)
export interface ContainerType extends BaseEntity {
  name: string;
  size: number; // in m³
  unit: string; // in m³
}

export type CreateTankRequest = Omit<
  ContainerType,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateTankRequest = Partial<CreateTankRequest>;

// Report entity (matches database schema)
export interface Report extends BaseEntity {
  settlement_id: string;
  driver_id: string;
  container_type_id: string; // Changed from tank_id to match database
  volume: number; // in m³
  notes?: string;
  image_url?: string;
  image_public_id?: string;
  unit_price: number;
  total_price: number;
  currency: string;
  notification_sent: boolean;

  // Optional populated relationships
  driver?: Driver;
  tank?: ContainerType; // This represents the container_type
  settlement?: Settlement;
}

export type CreateReportRequest = Omit<
  Report,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'driver'
  | 'tank'
  | 'settlement'
  | 'total_price'
> & {
  // Keep tank_id in the API for backward compatibility, but map it internally
  tank_id?: string; // This will be mapped to container_type_id
};
export type UpdateReportRequest = Partial<CreateReportRequest>;

// Report filters for queries
export interface ReportFilters {
  driver_id?: string;
  tank_id?: string; // Keep for API compatibility, maps to container_type_id
  settlement_id?: string;
  report_date_from?: string;
  report_date_to?: string;
  waste_type?: string;
  condition?: string;
}

// Pagination parameters
export interface PaginationParams {
  page?: string;
  limit?: string;
}

// Common query parameters
export interface QueryParams extends PaginationParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// API Response wrapper (reexported from api.ts for convenience)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Statistics types for dashboard
export interface DashboardStats {
  total_settlements: number;
  active_drivers: number;
  active_tanks: number;
  reports_this_month: number;
  total_volume_collected: number;
  average_daily_collection: number;
}

export interface CollectionSummary {
  date: string;
  total_volume: number;
  report_count: number;
  settlements_served: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  validation_errors?: ValidationError[];
}

// Route parameters
export interface SettlementParams {
  id: string;
}

export interface DriverParams {
  id: string;
}

export interface TankParams {
  id: string;
}

export interface ReportParams {
  id: string;
}

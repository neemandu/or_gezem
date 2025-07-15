/**
 * Database Types for Hebrew Green Waste Management System
 * Auto-generated from Supabase schema
 */

// ====================================
// ENUMS
// ====================================

export type UserRole = 'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER';

export type NotificationType = 'WHATSAPP';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';

// ====================================
// BASE TABLE TYPES
// ====================================

export interface Settlement {
  id: string;
  name: string;
  contact_phone: string | null;
  contact_person: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  settlement_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContainerType {
  id: string;
  name: string;
  size: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementTankPricing {
  id: string;
  settlement_id: string;
  container_type_id: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  settlement_id: string;
  driver_id: string;
  container_type_id: string;
  volume: number;
  notes: string | null;
  image_url: string | null;
  image_public_id: string | null;
  unit_price: number;
  total_price: number;
  currency: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  report_id: string;
  type: NotificationType;
  status: NotificationStatus;
  green_api_message_id: string | null;
  message: string;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

// ====================================
// EXTENDED TYPES WITH RELATIONSHIPS
// ====================================

export interface UserWithSettlement extends User {
  settlement?: Settlement | null;
}

export interface SettlementWithUsers extends Settlement {
  users?: User[];
}

export interface SettlementTankPricingWithRelations
  extends SettlementTankPricing {
  settlement?: Settlement;
  container_type?: ContainerType;
}

export interface ReportWithRelations extends Report {
  settlement?: Settlement;
  driver?: User;
  container_type?: ContainerType;
  notifications?: Notification[];
}

export interface NotificationWithReport extends Notification {
  report?: ReportWithRelations;
}

// ====================================
// INSERT TYPES (for creating new records)
// ====================================

export type SettlementInsert = Omit<
  Settlement,
  'id' | 'created_at' | 'updated_at'
>;

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;

export type ContainerTypeInsert = Omit<
  ContainerType,
  'id' | 'created_at' | 'updated_at'
>;

export type SettlementTankPricingInsert = Omit<
  SettlementTankPricing,
  'id' | 'created_at' | 'updated_at'
>;

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'updated_at'>;

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;

// ====================================
// UPDATE TYPES (for updating records)
// ====================================

export type SettlementUpdate = Partial<
  Omit<Settlement, 'id' | 'created_at' | 'updated_at'>
>;

export type UserUpdate = Partial<
  Omit<User, 'id' | 'created_at' | 'updated_at'>
>;

export type ContainerTypeUpdate = Partial<
  Omit<ContainerType, 'id' | 'created_at' | 'updated_at'>
>;

export type SettlementTankPricingUpdate = Partial<
  Omit<SettlementTankPricing, 'id' | 'created_at' | 'updated_at'>
>;

export type ReportUpdate = Partial<
  Omit<Report, 'id' | 'created_at' | 'updated_at'>
>;

export type NotificationUpdate = Partial<
  Omit<Notification, 'id' | 'created_at'>
>;

// ====================================
// FILTER TYPES
// ====================================

export interface SettlementFilters {
  name?: string;
  contact_person?: string;
}

export interface UserFilters {
  email?: string;
  role?: UserRole;
  settlement_id?: string;
}

export interface ReportFilters {
  settlement_id?: string;
  driver_id?: string;
  container_type_id?: string;
  date_from?: string;
  date_to?: string;
  notification_sent?: boolean;
  min_volume?: number;
  max_volume?: number;
  min_total_price?: number;
  max_total_price?: number;
}

export interface NotificationFilters {
  report_id?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  date_from?: string;
  date_to?: string;
}

// ====================================
// SORT OPTIONS
// ====================================

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}

// ====================================
// PAGINATION
// ====================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ====================================
// API RESPONSE TYPES
// ====================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginatedResponse<T>['pagination'];
}

// ====================================
// FORM TYPES
// ====================================

export interface SettlementFormData {
  name: string;
  contact_phone?: string;
  contact_person?: string;
}

export interface UserFormData {
  email: string;
  role: UserRole;
  settlement_id?: string;
}

export interface ContainerTypeFormData {
  name: string;
  size: number;
  unit?: string;
}

export interface SettlementTankPricingFormData {
  settlement_id: string;
  container_type_id: string;
  price: number;
  currency?: string;
  is_active?: boolean;
}

export interface ReportFormData {
  settlement_id: string;
  container_type_id: string;
  volume: number;
  notes?: string;
  image_url?: string;
  image_public_id?: string;
}

export interface NotificationFormData {
  report_id: string;
  type: NotificationType;
  message: string;
}

// ====================================
// STATISTICS TYPES
// ====================================

export interface SettlementStats {
  settlement_id: string;
  settlement_name: string;
  total_reports: number;
  total_volume: number;
  total_revenue: number;
  last_report_date: string | null;
  pending_notifications: number;
}

export interface DriverStats {
  driver_id: string;
  driver_email: string;
  total_reports: number;
  total_volume: number;
  total_revenue: number;
  settlements_served: number;
  last_report_date: string | null;
}

export interface SystemStats {
  total_settlements: number;
  total_drivers: number;
  total_reports: number;
  total_volume: number;
  total_revenue: number;
  pending_notifications: number;
  reports_today: number;
  reports_this_week: number;
  reports_this_month: number;
}

// ====================================
// DASHBOARD TYPES
// ====================================

export interface DashboardData {
  stats: SystemStats;
  recent_reports: ReportWithRelations[];
  pending_notifications: NotificationWithReport[];
  settlement_stats: SettlementStats[];
  driver_stats: DriverStats[];
}

// ====================================
// SEARCH TYPES
// ====================================

export interface SearchParams {
  query: string;
  filters?: {
    settlements?: string[];
    drivers?: string[];
    container_types?: string[];
    date_range?: {
      from: string;
      to: string;
    };
  };
  sort?: SortOption;
  pagination?: PaginationParams;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters_applied: string[];
}

// ====================================
// ERROR TYPES
// ====================================

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ====================================
// AUTH TYPES
// ====================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  settlement_id: string | null;
  settlement?: Settlement | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// ====================================
// UTILITY TYPES
// ====================================

export type TableNames =
  | 'users'
  | 'settlements'
  | 'container_types'
  | 'settlement_tank_pricing'
  | 'reports'
  | 'notifications';

export type DatabaseTables = {
  users: User;
  settlements: Settlement;
  container_types: ContainerType;
  settlement_tank_pricing: SettlementTankPricing;
  reports: Report;
  notifications: Notification;
};

// ====================================
// CONSTANTS
// ====================================

export const USER_ROLES: Record<UserRole, string> = {
  ADMIN: 'מנהל מערכת',
  SETTLEMENT_USER: 'משתמש יישוב',
  DRIVER: 'נהג',
} as const;

export const NOTIFICATION_TYPES: Record<NotificationType, string> = {
  WHATSAPP: 'WhatsApp',
} as const;

export const NOTIFICATION_STATUSES: Record<NotificationStatus, string> = {
  PENDING: 'ממתין',
  SENT: 'נשלח',
  FAILED: 'נכשל',
  DELIVERED: 'נמסר',
} as const;

export const DEFAULT_CURRENCY = 'ILS';
export const DEFAULT_UNIT = 'm³';

// ====================================
// TYPE GUARDS
// ====================================

export function isUserRole(value: string): value is UserRole {
  return ['ADMIN', 'SETTLEMENT_USER', 'DRIVER'].includes(value);
}

export function isNotificationType(value: string): value is NotificationType {
  return value === 'WHATSAPP';
}

export function isNotificationStatus(
  value: string
): value is NotificationStatus {
  return ['PENDING', 'SENT', 'FAILED', 'DELIVERED'].includes(value);
}

// ====================================
// HELPER FUNCTIONS
// ====================================

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatVolume(
  volume: number,
  unit: string = DEFAULT_UNIT
): string {
  return `${volume.toLocaleString('he-IL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} ${unit}`;
}

export function getUserRoleDisplayName(role: UserRole): string {
  return USER_ROLES[role];
}

export function getNotificationStatusDisplayName(
  status: NotificationStatus
): string {
  return NOTIFICATION_STATUSES[status];
}

// ====================================
// VALIDATION SCHEMAS (for use with libraries like Zod)
// ====================================

export interface ValidationSchema {
  settlement: {
    name: { required: true; minLength: 2; maxLength: 255 };
    contact_phone: { required: false; pattern: string };
    contact_person: { required: false; maxLength: 255 };
  };
  user: {
    email: { required: true; pattern: string };
    role: { required: true; enum: UserRole[] };
    settlement_id: { required: false };
  };
  container_type: {
    name: { required: true; minLength: 2; maxLength: 255 };
    size: { required: true; min: 0.1; max: 50 };
    unit: { required: false; maxLength: 10 };
  };
  report: {
    volume: { required: true; min: 0.01; max: 50 };
    notes: { required: false; maxLength: 1000 };
  };
}

export const VALIDATION_PATTERNS = {
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  phone: /^(\+972|0)[2-9][0-9]{7,8}$/,
  currency: /^[A-Z]{3}$/,
} as const;

import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
const emailSchema = z.string().email().optional();
// const phoneSchema = z
//   .string()
//   .regex(phoneRegex, 'מספר טלפון לא תקין')
//   .optional();
// const requiredPhoneSchema = z
//   .string()
//   .regex(phoneRegex, 'מספר טלפון נדרש ותקין');

// Settlement validation schemas (matches database schema)
export const createSettlementSchema = z.object({
  name: z.string().min(1, 'שם היישוב נדרש').max(255, 'שם היישוב ארוך מדי'),
  contact_person: z.string().max(255, 'שם איש קשר ארוך מדי').optional(),
  contact_phone: z.string().max(20, 'מספר טלפון ארוך מדי').optional(),
});

export const updateSettlementSchema = createSettlementSchema.partial();

// Driver validation schemas (matches users table with additional fields)
export const createDriverSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  // Optional password - if not provided, will be auto-generated
  password: z
    .string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .max(50, 'סיסמה ארוכה מדי')
    .optional(),
  // Additional driver-specific fields (to be handled in application logic)
  first_name: z
    .string()
    .min(1, 'שם פרטי נדרש')
    .max(50, 'שם פרטי ארוך מדי')
    .optional(),
  last_name: z
    .string()
    .min(1, 'שם משפחה נדרש')
    .max(50, 'שם משפחה ארוך מדי')
    .optional(),
  // phone: z.string().max(20, 'מספר טלפון ארוך מדי').optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

// Container Type validation schemas (what was previously Tank)
export const createTankSchema = z.object({
  name: z.string().min(1, 'שם המכל נדרש').max(255, 'שם המכל ארוך מדי'),
  size: z.number().positive('גודל חייב להיות חיובי').max(100, 'גודל גדול מדי'),
  unit: z.string().max(10, 'יחידה ארוכה מדי').default('m³'),
});

export const updateTankSchema = createTankSchema.partial();

// Report validation schemas (matches database schema)
const baseReportSchema = z.object({
  settlement_id: z.string().uuid('מזהה יישוב לא תקין'),
  driver_id: z.string().uuid('מזהה נהג לא תקין'),
  container_type_id: z.string().uuid('מזהה סוג מכל לא תקין'),
  tank_id: z.string().uuid('מזהה מכל לא תקין').optional(), // For API compatibility, maps to container_type_id
  volume: z
    .number()
    .nonnegative('נפח חייב להיות אי-שלילי')
    .max(100, 'נפח גדול מדי'),
  notes: z.string().max(1000, 'הערות ארוכות מדי').optional(),
  image_url: z.string().url('כתובת תמונה לא תקינה').optional(),
  image_public_id: z.string().max(255, 'מזהה תמונה ארוך מדי').optional(),
  unit_price: z.number().nonnegative('מחיר יחידה חייב להיות אי-שלילי'),
  currency: z.string().length(3, 'מטבע חייב להיות 3 תווים').default('ILS'),
  notification_sent: z.boolean().default(false),
});

// Create schema with optional pricing fields (will be calculated automatically)
export const createReportSchema = baseReportSchema
  .partial({ unit_price: true })
  .extend({
    total_price: z
      .number()
      .nonnegative('מחיר כולל חייב להיות אי-שלילי')
      .optional(),
  })
  .refine((data) => {
    // If tank_id is provided, use it as container_type_id
    if (data.tank_id && !data.container_type_id) {
      data.container_type_id = data.tank_id;
    }
    return true;
  });

export const updateReportSchema = baseReportSchema.partial();

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'עמוד חייב להיות מספר')
    .transform(Number)
    .refine((n) => n > 0, 'עמוד חייב להיות חיובי')
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'גבולת חייבת להיות מספר')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'גבולת חייבת להיות בין 1-100')
    .default('10'),
});

export const queryParamsSchema = paginationSchema.extend({
  search: z.string().max(100, 'חיפוש ארוך מדי').optional(),
  sort: z.string().max(50, 'מיון ארוך מדי').optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const reportFiltersSchema = paginationSchema.extend({
  driver_id: z.string().uuid('מזהה נהג לא תקין').optional(),
  tank_id: z.string().uuid('מזהה מכל לא תקין').optional(),
  settlement_id: z.string().uuid('מזהה יישוב לא תקין').optional(),
  report_date_from: z.string().date('תאריך התחלה לא תקין').optional(),
  report_date_to: z.string().date('תאריך סיום לא תקין').optional(),
  waste_type: z.enum(['green_waste', 'organic', 'mixed']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

// Pricing validation schemas (matches settlement_tank_pricing table)
export const createPricingSchema = z.object({
  settlement_id: z.string().uuid('מזהה יישוב לא תקין'),
  container_type_id: z.string().uuid('מזהה סוג מכל לא תקין'),
  price: z.number().positive('מחיר חייב להיות גדול מ-0'),
  currency: z.string().length(3, 'מטבע חייב להיות 3 תווים').default('ILS'),
  is_active: z.boolean().default(true),
});

export const updatePricingSchema = createPricingSchema.partial();

export const pricingFiltersSchema = queryParamsSchema.extend({
  settlement_id: z.string().uuid('מזהה יישוב לא תקין').optional(),
  container_type_id: z.string().uuid('מזהה סוג מכל לא תקין').optional(),
  is_active: z.boolean().optional(),
  currency: z.string().length(3, 'מטבע לא תקין').optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().uuid('מזהה לא תקין'),
});

// Utility functions for validation
export function validateId(id: string): string {
  const result = idParamSchema.parse({ id });
  return result.id;
}

export function parseAndValidateId(params: { id: string }): string {
  return validateId(params.id);
}

// Type exports for TypeScript inference
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type UpdateSettlementInput = z.infer<typeof updateSettlementSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type CreateTankInput = z.infer<typeof createTankSchema>;
export type UpdateTankInput = z.infer<typeof updateTankSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type CreatePricingInput = z.infer<typeof createPricingSchema>;
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;
export type PricingFiltersInput = z.infer<typeof pricingFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;

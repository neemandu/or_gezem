import { createClient } from '@/lib/supabase/server';
import { SettlementTankPricing, ContainerType } from '@/types/database';

export interface PricingResult {
  success: boolean;
  data?: {
    pricing: SettlementTankPricing;
    container_type: ContainerType;
    unit_price: number; // price per m³
  };
  error?: string;
}

export interface PriceCalculationResult {
  success: boolean;
  data?: {
    unit_price: number;
    total_price: number;
    currency: string;
    pricing_id: string;
  };
  error?: string;
}

/**
 * Get pricing for a specific settlement and container type
 */
export async function getPriceForSettlementAndContainer(
  settlementId: string,
  containerTypeId: string
): Promise<PricingResult> {
  try {
    const supabase = await createClient();

    // Get active pricing for settlement and container type
    const { data: pricing, error: pricingError } = await supabase
      .from('settlement_tank_pricing')
      .select(
        `
        *,
        container_type:container_types(*)
      `
      )
      .eq('settlement_id', settlementId)
      .eq('container_type_id', containerTypeId)
      .eq('is_active', true)
      .single();

    if (pricingError) {
      return {
        success: false,
        error: `לא נמצא תמחור פעיל עבור היישוב וסוג המכל הנבחרים: ${pricingError.message}`,
      };
    }

    if (!pricing || !pricing.container_type) {
      return {
        success: false,
        error: 'לא נמצא תמחור פעיל עבור היישוב וסוג המכל הנבחרים',
      };
    }

    // Calculate unit price (price per m³)
    const unitPrice = pricing.price / pricing.container_type.size;

    return {
      success: true,
      data: {
        pricing,
        container_type: pricing.container_type,
        unit_price: unitPrice,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `שגיאה בחיפוש תמחור: ${error.message}`
          : 'שגיאה בחיפוש תמחור',
    };
  }
}

/**
 * Calculate total price for a report
 */
export async function calculateTotalPrice(
  settlementId: string,
  containerTypeId: string,
  volume: number
): Promise<PriceCalculationResult> {
  try {
    // Input validation
    if (volume <= 0) {
      return {
        success: false,
        error: 'נפח חייב להיות גדול מ-0',
      };
    }

    // Get pricing information
    const pricingResult = await getPriceForSettlementAndContainer(
      settlementId,
      containerTypeId
    );

    if (!pricingResult.success || !pricingResult.data) {
      return {
        success: false,
        error: pricingResult.error || 'לא נמצא תמחור',
      };
    }

    const { pricing, unit_price } = pricingResult.data;

    // Calculate total price
    const totalPrice = volume * unit_price;

    return {
      success: true,
      data: {
        unit_price,
        total_price: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        currency: pricing.currency,
        pricing_id: pricing.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `שגיאה בחישוב מחיר: ${error.message}`
          : 'שגיאה בחישוב מחיר',
    };
  }
}

/**
 * Format price for display in Hebrew
 */
export function formatPrice(price: number, currency: string = 'ILS'): string {
  const currencySymbol = currency === 'ILS' ? '₪' : currency;

  // Format with Hebrew number formatting
  const formattedNumber = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return `${formattedNumber} ${currencySymbol}`;
}

/**
 * Validate pricing data
 */
export function validatePricingData(data: {
  price: number;
  settlement_id?: string;
  container_type_id?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.price <= 0) {
    errors.push('מחיר חייב להיות גדול מ-0');
  }

  if (data.price > 10000) {
    errors.push('מחיר גבוה מדי (מעל 10,000)');
  }

  if (
    data.settlement_id &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      data.settlement_id
    )
  ) {
    errors.push('מזהה יישוב לא תקין');
  }

  if (
    data.container_type_id &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      data.container_type_id
    )
  ) {
    errors.push('מזהה סוג מכל לא תקין');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get all active pricing for a settlement
 */
export async function getSettlementPricing(settlementId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('settlement_tank_pricing')
      .select(
        `
        *,
        container_type:container_types(*)
      `
      )
      .eq('settlement_id', settlementId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: `שגיאה בטעינת תמחור: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `שגיאה בטעינת תמחור: ${error.message}`
          : 'שגיאה בטעינת תמחור',
    };
  }
}

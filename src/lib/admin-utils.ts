import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration for admin operations');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface CreateUserData {
  email: string;
  password: string;
  role: 'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER';
  name?: string;
  settlement_id?: string | null;
  // Additional metadata for drivers
  phone?: string;
  license_number?: string;
  first_name?: string;
  last_name?: string;
  hire_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface CreateUserResult {
  success: boolean;
  data?: {
    user_id: string;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Create a new user with Supabase Auth and profile entry
 * Follows the same pattern as create-auth-users.js script
 */
export async function createAuthUser(
  userData: CreateUserData
): Promise<CreateUserResult> {
  try {
    const supabaseAdmin = createAdminClient();

    // Prepare user metadata
    const userMetadata: Record<string, any> = {
      role: userData.role,
    };

    // Add name if provided
    if (userData.name) {
      userMetadata.name = userData.name;
    }

    // For drivers, add additional metadata
    if (userData.role === 'DRIVER') {
      if (userData.phone) userMetadata.phone = userData.phone;
      if (userData.license_number)
        userMetadata.license_number = userData.license_number;
      if (userData.first_name) userMetadata.first_name = userData.first_name;
      if (userData.last_name) userMetadata.last_name = userData.last_name;
      if (userData.hire_date) userMetadata.hire_date = userData.hire_date;
      if (userData.emergency_contact_name)
        userMetadata.emergency_contact_name = userData.emergency_contact_name;
      if (userData.emergency_contact_phone)
        userMetadata.emergency_contact_phone = userData.emergency_contact_phone;
      if (userData.notes) userMetadata.notes = userData.notes;
    }

    // Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: userMetadata,
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return {
          success: false,
          error: `משתמש עם האימייל ${userData.email} כבר קיים במערכת`,
        };
      }
      return {
        success: false,
        error: `שגיאה ביצירת המשתמש: ${authError.message}`,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'שגיאה לא צפויה ביצירת המשתמש',
      };
    }

    // Create or update profile entry in users table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        settlement_id: userData.settlement_id || null,
      })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: `שגיאה ביצירת פרופיל המשתמש: ${profileError.message}`,
      };
    }

    return {
      success: true,
      data: {
        user_id: authData.user.id,
        email: userData.email,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error('Error creating auth user:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'שגיאה לא צפויה ביצירת המשתמש',
    };
  }
}

/**
 * Generate a secure random password
 */
export function generatePassword(length: number = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

/**
 * Get user details including metadata
 */
export async function getUserWithMetadata(userId: string) {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return {
        success: false,
        error: 'משתמש לא נמצא',
      };
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return {
        success: false,
        error: 'פרופיל משתמש לא נמצא',
      };
    }

    return {
      success: true,
      data: {
        ...profileData,
        user_metadata: authUser.user.user_metadata || {},
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'שגיאה בטעינת פרטי המשתמש',
    };
  }
}

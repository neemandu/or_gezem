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
  email?: string;
  phone?: string;
  password: string;
  role: 'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER';
  settlement_id?: string | null;
  first_name?: string;
  last_name?: string;
  user_metadata?: Record<string, any>;
}

export interface CreateUserResult {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    phone?: string;
    role: 'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER';
  };
  error?: string;
}

/**
 * Creates a new auth user in Supabase Auth and syncs to local users table
 * Supports both email and phone-based authentication
 */
export async function createAuthUser(
  userData: CreateUserData
): Promise<CreateUserResult> {
  const supabase = createAdminClient();

  try {
    // Validate that either email or phone is provided
    if (!userData.email && !userData.phone) {
      return {
        success: false,
        error: 'Either email or phone number is required',
      };
    }

    // For drivers, phone is preferred; for others, email is required
    if (userData.role === 'DRIVER' && !userData.phone) {
      return {
        success: false,
        error: 'Phone number is required for drivers',
      };
    }

    if (
      (userData.role === 'ADMIN' || userData.role === 'SETTLEMENT_USER') &&
      !userData.email
    ) {
      return {
        success: false,
        error: 'Email is required for admin and settlement users',
      };
    }

    console.log('Creating auth user with data:', {
      ...userData,
      password: '[REDACTED]',
    });

    // Create user in Supabase Auth
    const authData: any = {
      password: userData.password,
      options: {
        data: {
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          ...userData.user_metadata,
        },
      },
    };

    // Add email or phone to auth data
    if (userData.phone) {
      authData.phone = userData.phone;
    } else if (userData.email) {
      authData.email = userData.email;
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser(authData);

    if (authError) {
      console.error('Supabase auth error:', authError);
      return {
        success: false,
        error: `Authentication error: ${authError.message}`,
      };
    }

    if (!authUser.user) {
      return {
        success: false,
        error: 'Failed to create user - no user returned from auth',
      };
    }

    console.log('Auth user created successfully:', authUser.user.id);

    // Create user profile in local users table
    const localUserData: any = {
      id: authUser.user.id,
      role: userData.role,
      settlement_id: userData.settlement_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
    };

    // Add email or phone to local user data
    if (userData.phone) {
      localUserData.phone = userData.phone;
    }
    if (userData.email) {
      localUserData.email = userData.email;
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert([localUserData]);

    if (dbError) {
      console.error('Database insert error:', dbError);

      // Try to clean up the auth user if local user creation fails
      try {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }

      return {
        success: false,
        error: `Database error: ${dbError.message}`,
      };
    }

    console.log('Local user profile created successfully');

    return {
      success: true,
      user: {
        id: authUser.user.id,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error('Unexpected error in createAuthUser:', error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '../types/database';
import type { SupabaseConfig, IntegrationError } from '../types/integrations';

// Define the Supabase client type with our database schema
export type TypedSupabaseClient = SupabaseClient<Database>;

// Configuration object
const supabaseConfig: SupabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
};

// Create the main Supabase client (for client-side operations)
export const supabase: TypedSupabaseClient = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'or-gezem-app',
      },
    },
  }
);

// Create the admin client (for server-side operations with elevated privileges)
export const supabaseAdmin: TypedSupabaseClient = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to create a server-side client with proper context
export function createServerSupabaseClient(): TypedSupabaseClient {
  return createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Error handling utility for Supabase operations
export function handleSupabaseError(error: any): IntegrationError {
  return {
    service: 'supabase',
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    details: error,
  };
}

// Auth utilities
export const auth = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true as const, data };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true as const, data: null };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true as const, data: user };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      });
      if (error) throw error;
      return { success: true as const, data: null };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },
};

// Database utilities
export const db = {
  // Generic query helper with error handling
  async query<T>(queryFn: (client: TypedSupabaseClient) => Promise<any>) {
    try {
      const result = await queryFn(supabase);
      if (result.error) throw result.error;
      return { success: true as const, data: result.data as T };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Admin query helper
  async adminQuery<T>(queryFn: (client: TypedSupabaseClient) => Promise<any>) {
    try {
      const result = await queryFn(supabaseAdmin);
      if (result.error) throw result.error;
      return { success: true as const, data: result.data as T };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },
};

// Storage utilities (Enhanced for image handling)
export const storage = {
  // Upload file to storage with validation
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: {
      maxSizeBytes?: number;
      allowedTypes?: string[];
      upsert?: boolean;
      supabaseClient?: TypedSupabaseClient;
    }
  ) {
    try {
      const maxSize = options?.maxSizeBytes || 10 * 1024 * 1024; // 10MB default
      const allowedTypes = options?.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      // Use provided client or default to global client
      const client = options?.supabaseClient || supabase;

      // Validate file size
      if (file.size > maxSize) {
        return {
          success: false as const,
          error: {
            service: 'supabase',
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
          },
        };
      }

      // Validate file type for File objects
      if (file instanceof File && !allowedTypes.includes(file.type)) {
        return {
          success: false as const,
          error: {
            service: 'supabase',
            code: 'INVALID_FILE_TYPE',
            message: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          },
        };
      }

      const { data, error } = await client.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert ?? true,
        });

      if (error) throw error;
      return { success: true as const, data };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Upload image with automatic path generation
  async uploadImage(
    bucket: string,
    file: File,
    folder?: string,
    supabaseClient?: TypedSupabaseClient
  ) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const uploadResult = await this.uploadFile(bucket, filePath, file, {
        supabaseClient,
      });

      if (!uploadResult.success) {
        return uploadResult;
      }

      // Use the same client for getting public URL
      const client = supabaseClient || supabase;
      const publicUrl = this.getPublicUrl(bucket, filePath, client);

      return {
        success: true as const,
        data: {
          ...uploadResult.data,
          publicUrl,
          filePath,
        },
      };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Get public URL
  getPublicUrl(
    bucket: string,
    path: string,
    supabaseClient?: TypedSupabaseClient
  ): string {
    const client = supabaseClient || supabase;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Get signed URL for private files
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return { success: true as const, data };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Delete file from storage
  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;
      return { success: true as const, data: null };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Delete multiple files
  async deleteFiles(bucket: string, paths: string[]) {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) throw error;
      return { success: true as const, data: null };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // List files in a bucket/folder
  async listFiles(bucket: string, folder?: string) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder);

      if (error) throw error;
      return { success: true as const, data };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Move/rename file
  async moveFile(bucket: string, fromPath: string, toPath: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) throw error;
      return { success: true as const, data: null };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },

  // Create bucket (admin operation)
  async createBucket(bucketName: string, options?: { public?: boolean }) {
    try {
      const { data, error } = await supabaseAdmin.storage.createBucket(
        bucketName,
        {
          public: options?.public ?? true,
        }
      );

      if (error) throw error;
      return { success: true as const, data };
    } catch (error) {
      return { success: false as const, error: handleSupabaseError(error) };
    }
  },
};

// Realtime utilities
export const realtime = {
  // Subscribe to table changes
  subscribeToTable<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return {
      unsubscribe: () => supabase.removeChannel(channel),
    };
  },

  // Subscribe to presence
  subscribeToPresence(channelName: string, config: any) {
    const channel = supabase.channel(channelName);

    return {
      channel,
      track: (state: any) => channel.track(state),
      untrack: () => channel.untrack(),
      subscribe: (callback: (state: any) => void) => {
        // Note: Presence events may require specific Supabase configuration
        // This is a placeholder implementation
        return channel.subscribe();
      },
      unsubscribe: () => supabase.removeChannel(channel),
    };
  },
};

// Health check utility
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);

    return {
      success: !error,
      error: error ? handleSupabaseError(error) : null,
    };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}

export default supabase;

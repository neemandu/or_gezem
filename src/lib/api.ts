import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

// API Response types
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

// API Error classes
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public issues?: any[]
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// Success response helper
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// Error response helper
export function errorResponse(
  error: string,
  statusCode: number = 500
): ApiResponse {
  return {
    success: false,
    error,
  };
}

// Paginated response helper
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Request validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request data', error.issues);
    }
    throw new ApiError('Invalid JSON format', 400);
  }
}

// Query parameter validation helper
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid query parameters', error.issues);
    }
    throw new ApiError('Invalid query parameters', 400);
  }
}

// Generic API route handler wrapper
export function apiHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<ApiResponse<T>>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      const response = await handler(request, context);
      return NextResponse.json(response);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          errorResponse(error.message, error.statusCode),
          { status: error.statusCode }
        );
      }

      // Generic server error
      return NextResponse.json(errorResponse('Internal server error'), {
        status: 500,
      });
    }
  };
}

// CRUD operation helpers with Supabase
export class CrudService<T = any> {
  constructor(private tableName: string) {}

  async getAll(
    filters?: Record<string, any>,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedResponse<T>> {
    const supabase = await createClient();

    let query = supabase.from(this.tableName).select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle search filters with ILIKE for text search
          if (key === 'name' && typeof value === 'string') {
            query = query.ilike(key, `%${value}%`);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }

    // Apply pagination
    if (pagination) {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new ApiError(`Failed to fetch ${this.tableName}: ${error.message}`);
    }

    if (pagination) {
      return paginatedResponse(
        data as T[],
        pagination.page,
        pagination.limit,
        count || 0
      );
    }

    return successResponse(data as T[]);
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`${this.tableName} with id ${id}`);
      }
      throw new ApiError(`Failed to fetch ${this.tableName}: ${error.message}`);
    }

    return successResponse(data as T);
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    const supabase = await createClient();

    const { data: newRecord, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        `Failed to create ${this.tableName}: ${error.message}`
      );
    }

    return successResponse(
      newRecord as T,
      `${this.tableName} created successfully`
    );
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    const supabase = await createClient();

    const { data: updatedRecord, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`${this.tableName} with id ${id}`);
      }
      throw new ApiError(
        `Failed to update ${this.tableName}: ${error.message}`
      );
    }

    return successResponse(
      updatedRecord as T,
      `${this.tableName} updated successfully`
    );
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = await createClient();

    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new ApiError(
        `Failed to delete ${this.tableName}: ${error.message}`
      );
    }

    return successResponse(null, `${this.tableName} deleted successfully`);
  }
}

// Pagination helpers
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '10'))
  );
  return { page, limit };
}

// Authentication helper
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log('user', user);

  if (error || !user) {
    throw new UnauthorizedError('Authentication required');
  }

  return user;
}

/**
 * Type-safe response wrapper for Elysia handlers
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (code: string, message: string): ApiResponse<never> => ({
  success: false,
  error: { code, message },
  timestamp: new Date().toISOString(),
});

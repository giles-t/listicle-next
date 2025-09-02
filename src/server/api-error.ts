export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
  
  static badRequest(msg: string = 'Bad request') {
    return new ApiError(msg, 400);
  }
  
  static unauthorized(msg: string = 'Unauthorized') {
    return new ApiError(msg, 401);
  }
  
  static forbidden(msg: string = 'Forbidden') {
    return new ApiError(msg, 403);
  }
  
  static notFound(msg: string = 'Resource not found') {
    return new ApiError(msg, 404);
  }
  
  static methodNotAllowed(msg: string = 'Method not allowed') {
    return new ApiError(msg, 405);
  }
  
  static conflict(msg: string = 'Resource conflict') {
    return new ApiError(msg, 409);
  }
  
  static unprocessableEntity(msg: string = 'Unprocessable entity') {
    return new ApiError(msg, 422);
  }
  
  static internal(msg: string = 'Internal server error') {
    return new ApiError(msg, 500);
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API error:', error);
  
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
  
  return new Response(
    JSON.stringify({
      error: 'An unknown error occurred',
    }),
    { status: 500 }
  );
}; 
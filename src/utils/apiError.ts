export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, message: string, code: string = 'ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad request', code: string = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message: string = 'Forbidden - Insufficient permissions', code: string = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message: string = 'Resource conflict', code: string = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
    return new ApiError(500, message, code);
  }
}

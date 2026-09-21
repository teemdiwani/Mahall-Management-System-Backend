import type { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode: number = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginate<T>(
    res: Response,
    items: T[],
    page: number,
    limit: number,
    total: number
  ) {
    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  }
}

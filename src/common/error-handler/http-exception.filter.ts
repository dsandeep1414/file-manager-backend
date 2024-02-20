import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    const errorMessage =
      (errorResponse as HttpExceptionResponse).message || exception.message;
    response.status(status).json({
      status: status,
      error: true,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}

export interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

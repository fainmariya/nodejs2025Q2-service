import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { LoggingService } from './logging.service';
  
  @Catch() // ловим вообще все исключения
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggingService) {}
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const response = exception.getResponse();
  
        if (typeof response === 'string') {
          message = response;
        } else if (
          typeof response === 'object' &&
          response !== null &&
          'message' in response
        ) {
          const msg = (response as any).message;
          message = Array.isArray(msg) ? msg.join(', ') : msg ?? message;
        }
      }
  
      this.logger.error(
        `Exception during ${req.method} ${req.url} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
  
      res.status(status).json({
        statusCode: status,
        message,
      });
    }
  }
  
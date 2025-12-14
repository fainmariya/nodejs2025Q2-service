import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, query, body } = req;

    // входящий запрос
    this.logger.log(`Incoming request: ${method} ${originalUrl}`);
    this.logger.debug(`Query: ${JSON.stringify(query)}`);
    this.logger.debug(`Body: ${JSON.stringify(body)}`);

    // когда ответ уже отправлен — логируем статус
    res.on('finish', () => {
      this.logger.log(
        `Outgoing response: ${method} ${originalUrl} -> ${res.statusCode}`,
      );
    });

    next();
  }
}

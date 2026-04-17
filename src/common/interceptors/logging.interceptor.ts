import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getRequestId } from '../context/request-context';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly slowThreshold: number;

  constructor(private readonly configService: ConfigService) {
    this.slowThreshold = Number(this.configService.get('logging.slowRequestThreshold')) || 1000;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const statusCode = res.statusCode;
          const responseTime = Date.now() - now;
          const requestId = getRequestId();
          const message = `${method} ${originalUrl} ${statusCode} +${responseTime}ms`;

          if (responseTime > this.slowThreshold) {
            this.logger.warn(`SLOW_REQUEST ${message}`, requestId);
          } else {
            this.logger.log(message, requestId);
          }
        },
      }),
    );
  }
}

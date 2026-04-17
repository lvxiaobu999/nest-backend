import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContext } from 'src/common/context/request-context';

/*
  requestId / traceId middleware

  - generates one request-scoped identifier per request
  - stores request metadata in AsyncLocalStorage
  - returns IDs to the client for easier tracing
*/
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  RequestContext.run({ requestId, traceId }, () => {
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-trace-id', traceId);
    next();
  });
}

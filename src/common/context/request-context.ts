import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  requestId: string;
  traceId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export const RequestContext = {
  run: <T>(data: RequestContextData, callback: () => T): T =>
    asyncLocalStorage.run(data, callback),

  get: (): RequestContextData | undefined => asyncLocalStorage.getStore(),
};

export function getRequestId(): string | undefined {
  return asyncLocalStorage.getStore()?.requestId;
}

export function getTraceId(): string | undefined {
  return asyncLocalStorage.getStore()?.traceId;
}

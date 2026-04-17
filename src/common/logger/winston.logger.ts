import { ConfigService } from '@nestjs/config';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
// import { getRequestId } from '../context/request-context';

export const createWinstonLogger = (config: ConfigService) => {
  const isProd = config.get<string>('app.nodeEnv') === 'production';
  const level = config.get<string>('logging.level') || 'info';
  const appName = config.get<string>('app.name') || 'nest-app-admin';

  const requestIdFormat = winston.format((info) => {
    // info.requestId = getRequestId() || 'no-req-id';
    return info;
  });

  const devFormat = winston.format.combine(
    requestIdFormat(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    nestWinstonModuleUtilities.format.nestLike(appName, {
      prettyPrint: true,
    }),
  );

  const prodFormat = winston.format.combine(
    requestIdFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  return {
    level,
    format: isProd ? prodFormat : devFormat,
    transports: [
      new winston.transports.Console({
        silent: isProd,
      }),
      new winston.transports.DailyRotateFile({
        dirname: 'logs/combined',
        filename: '%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        zippedArchive: true,
        silent: !isProd,
      }),
      new winston.transports.DailyRotateFile({
        dirname: 'logs/error',
        filename: '%DATE%-error.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m', // 单文件最大20M
        maxFiles: '14d', // 文件最多保存14天
        zippedArchive: true, // 旧文件会被压缩
        silent: !isProd,
      }),
    ],
  };
};

import pino from 'pino';
import { config } from './config';

const logger = pino({
  level: config.app.isDevelopment ? 'debug' : 'info',
  transport: config.app.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,
  base: {
    env: config.app.environment,
  },
});

export default logger; 
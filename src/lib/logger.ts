import winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // Error log file (disabled for build)
  // new DailyRotateFile({
  //   filename: path.join(process.env.LOG_FILE_PATH || './logs', 'error-%DATE%.log'),
  //   datePattern: 'YYYY-MM-DD',
  //   level: 'error',
  //   format: fileFormat,
  //   maxSize: '20m',
  //   maxFiles: '14d',
  // }),
  
  // Combined log file (disabled for build)
  // new DailyRotateFile({
  //   filename: path.join(process.env.LOG_FILE_PATH || './logs', 'combined-%DATE%.log'),
  //   datePattern: 'YYYY-MM-DD',
  //   format: fileFormat,
  //   maxSize: '20m',
  //   maxFiles: '14d',
  // }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info({
    message,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn({
    message,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug({
    message,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info({
    message: `Performance: ${operation}`,
    duration: `${duration}ms`,
    context,
    timestamp: new Date().toISOString(),
  });
};

// API request logging
export const logApiRequest = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.http({
    message: 'API Request',
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userId,
    timestamp: new Date().toISOString(),
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, table: string, duration: number, success: boolean) => {
  logger.info({
    message: 'Database Operation',
    operation,
    table,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
  });
};

export default logger; 
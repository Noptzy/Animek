const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

// Custom levels and colors
const customLevels = {
  levels: {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    info: 'white',
    debug: 'magenta', // ungu
  },
};

winston.addColors(customLevels.colors);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Filters
const excludeLevel = (levelToExclude) =>
  winston.format((info) => (info.level === levelToExclude ? false : info))();
const excludeOnlyError = excludeLevel('error');
const excludeNonError = winston.format((info) => (info.level !== 'error' ? false : info))();

// File logs: structured JSON line per entry (best practice)
const fileJsonFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  winston.format((info) => {
    const { timestamp: ts, level, message, stack, ...meta } = info;
    const payload = {
      ts,
      level,
      message,
      ...(stack ? { stack } : {}),
      ...(Object.keys(meta).length ? { meta } : {}),
    };
    return { ...info, [Symbol.for('message')]: JSON.stringify(payload) };
  })(),
);

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${stack ? stack : message}`;
  }),
);

// Transports
const transports = [];

// Error file (daily rotate): only error level persisted
const errorFileTransport = new winston.transports.DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: combine(excludeNonError, fileJsonFormat),
});
transports.push(errorFileTransport);

// Console: show info, warning, debug; hide error entirely from console
transports.push(
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(excludeOnlyError, consoleFormat),
    handleExceptions: true,
    handleRejections: true,
  }),
);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports,
  exitOnError: false,
  exceptionHandlers: [errorFileTransport],
  rejectionHandlers: [errorFileTransport],
});

// Morgan stream bridge
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Alias for warn
logger.warn = (...args) => logger.warning(...args);

module.exports = logger;

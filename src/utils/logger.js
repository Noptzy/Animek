const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const level = process.env.LOG_LEVEL || 'info';

const colorizer = format.colorize({ all: true });

const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const base = `${timestamp} [${level}] ${message}`;
    const rest = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return colorizer.colorize(level, base) + rest;
  })
);

const errorFileTransport = new DailyRotateFile({
  dirname: path.resolve(process.cwd(), 'logs'),
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d',
  level: 'error',
});

const logger = createLogger({
  level,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({ format: consoleFormat }),
    errorFileTransport,
  ],
});

module.exports = { logger };

const morgan = require('morgan');
const logger = require('../config/logger');

// Morgan -> Winston bridge for HTTP request logging
// Info-level only; per logger config, not persisted to file
const httpLogger = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: logger.stream,
});

module.exports = httpLogger;

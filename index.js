require('dotenv').config();
const express = require('express');
const cors = require('cors');
const httpLogger = require('./src/middlewares/httpLogger');
const rateLimiter = require('./src/utils/rateLimiter');
const logger = require('./src/config/logger');
const { initializeCrashNotifier } = require('./src/utils/crashNotifier');

initializeCrashNotifier();

const app = express();
const PORT = process.env.PORT;
const corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(httpLogger);
app.use(rateLimiter); 

app.use((req, res) => {
    return res.status(404).json({error: "404 Not Found"});
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

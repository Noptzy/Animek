require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { logger } = require('./src/utils/logger');
const { globalLimiter, scrapeLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const corsOptions = {
    origin: '*',
};
const port = process.env.PORT || process.env.port || 3000;

app.use(cors(corsOptions));
app.use(helmet());
app.use(
    morgan('combined', {
        stream: {
            write: (msg) => logger.info(msg.trim()),
        },
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
});

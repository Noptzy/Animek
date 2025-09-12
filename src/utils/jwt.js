const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRE_IN || '7h';

const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRE_IN || '30d';

const generateToken = (payload, type = 'at') => {
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
        throw new Error('JWT payload must be a plain object');
    }
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: type === 'at' ? ACCESS_TOKEN_EXPIRES_IN : REFRESH_TOKEN_EXPIRES_IN,
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const refreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { iat, exp, ...userData } = decoded;
        return jwt.sign(userData, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    } catch (error) {
        return null;
    }
};

const decodedToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

const minimalPayload = (user) => {
    if (!user || typeof user !== 'object') return {};

    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
};

module.exports = {
    generateToken,
    refreshToken,
    verifyToken,
    minimalPayload,
    decodedToken,
};
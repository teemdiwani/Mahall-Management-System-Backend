"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieOptions = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
const getCookieOptions = () => {
    return {
        httpOnly: true,
        secure: env_js_1.env.NODE_ENV === 'production',
        sameSite: env_js_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    };
};
exports.getCookieOptions = getCookieOptions;

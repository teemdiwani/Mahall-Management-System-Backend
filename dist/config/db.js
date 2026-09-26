"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const env_js_1 = require("./env.js");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_js_1.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        if (error?.message?.includes('ECONNREFUSED') && env_js_1.env.MONGODB_URI.startsWith('mongodb+srv://')) {
            try {
                console.warn('⚠️ Retrying MongoDB Atlas connection using Google public DNS (8.8.8.8)...');
                dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
                const conn = await mongoose_1.default.connect(env_js_1.env.MONGODB_URI);
                console.log(`✅ MongoDB Connected with fallback DNS: ${conn.connection.host}/${conn.connection.name}`);
                return;
            }
            catch (retryError) {
                console.error('❌ MongoDB Connection Error after DNS retry:', retryError);
                process.exit(1);
            }
        }
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const logger_js_1 = require("./utils/logger.js");
const startServer = async () => {
    try {
        await (0, db_js_1.connectDB)();
        const app = (0, app_js_1.createApp)();
        const server = app.listen(env_js_1.env.PORT, () => {
            logger_js_1.logger.info(`🚀 MahallConnect Backend running on http://localhost:${env_js_1.env.PORT}`);
            logger_js_1.logger.info(`Environment: ${env_js_1.env.NODE_ENV}`);
        });
        const shutdown = () => {
            logger_js_1.logger.info('Shutting down server gracefully...');
            server.close(() => {
                logger_js_1.logger.info('Server closed');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        logger_js_1.logger.error(error, 'Fatal server bootstrap error');
        process.exit(1);
    }
};
startServer();

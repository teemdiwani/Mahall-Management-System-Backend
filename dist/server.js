"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const logger_js_1 = require("./utils/logger.js");
const startServer = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = (await response.json());
        console.log("Render outbound IP:", data.ip);
        await (0, db_js_1.connectDB)();
        const app = (0, app_js_1.createApp)();
        const server = app.listen(env_js_1.env.PORT, () => {
            logger_js_1.logger.info(`🚀 MahallConnect Backend running on http://localhost:${env_js_1.env.PORT}`);
            logger_js_1.logger.info(`Environment: ${env_js_1.env.NODE_ENV}`);
        });
        // Check 28th monthly dues on server startup & schedule periodic check
        try {
            const { PaymentsService } = await import('./modules/payments/payments.service.js');
            PaymentsService.checkAndTriggerMonthlyDues()
                .then((res) => {
                if (res && res.generated > 0 && 'month' in res) {
                    logger_js_1.logger.info(`[Monthly Dues] Automatically generated dues for ${res.generated} families (${res.month})`);
                }
            })
                .catch((err) => {
                logger_js_1.logger.error(err, '[Monthly Dues] Error in initial 28th dues check');
            });
            // Re-check periodically (every 1 hour)
            setInterval(() => {
                PaymentsService.checkAndTriggerMonthlyDues().catch((err) => {
                    logger_js_1.logger.error(err, '[Monthly Dues] Error in scheduled 28th dues check');
                });
            }, 60 * 60 * 1000);
        }
        catch (e) {
            logger_js_1.logger.error(e, 'Failed to initialize monthly dues scheduler');
        }
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

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    console.log("Render outbound IP:", data.ip);
    await connectDB();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 MahallConnect Backend running on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    // Check 28th monthly dues on server startup & schedule periodic check
    try {
      const { PaymentsService } = await import('./modules/payments/payments.service.js');
      PaymentsService.checkAndTriggerMonthlyDues()
        .then((res) => {
          if (res && res.generated > 0) {
            logger.info(`[Monthly Dues] Automatically generated dues for ${res.generated} families (${res.month})`);
          }
        })
        .catch((err) => {
          logger.error(err, '[Monthly Dues] Error in initial 28th dues check');
        });

      // Re-check periodically (every 1 hour)
      setInterval(() => {
        PaymentsService.checkAndTriggerMonthlyDues().catch((err) => {
          logger.error(err, '[Monthly Dues] Error in scheduled 28th dues check');
        });
      }, 60 * 60 * 1000);
    } catch (e) {
      logger.error(e, 'Failed to initialize monthly dues scheduler');
    }

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error(error, 'Fatal server bootstrap error');
    process.exit(1);
  }
};

startServer();

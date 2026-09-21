import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 MahallConnect Backend running on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

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

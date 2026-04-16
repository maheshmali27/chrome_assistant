import { Server } from 'http';
import { Sequelize } from 'sequelize';

export async function gracefulShutdown(
  server: Server,
  signal: string,
  sequelize: Sequelize
): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        console.log('HTTP server closed.');
        resolve();
      });
    });

    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

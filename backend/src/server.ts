import 'dotenv/config';
import http from 'http';

import app from './app/app';
import Env from './constant/env';
import sequelize from './db/sequelize.db';
import { gracefulShutdown } from './utils/gracefulShutdown';

const envWarning = Env.validateEnv();
if (envWarning) {
  console.warn(envWarning);
  process.exit(1);
}

const host = Env.SERVER_IP;
const port = Number(Env.SERVER_PORT);

const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/api/v1`);
  console.log(`Environment: ${Env.NODE_ENV}`);
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(server, signal, sequelize));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown(server, 'unhandledRejection', sequelize);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown(server, 'uncaughtException', sequelize);
});

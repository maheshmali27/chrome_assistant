/* global require, module, process, __dirname, console */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const path = require('path');

const dbName = process.env.DB_NAME || 'database.sqlite';

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../', dbName),
    logging: console.log,
  },
  test: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../', 'database.test.sqlite'),
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../', dbName),
    logging: false,
  },
};

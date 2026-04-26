import path from 'path';
import { Sequelize } from 'sequelize';

import Env from '../constant/env';

// Use process.cwd() so dev and build both point to backend/<DB_NAME>.
export const DBPATH = path.resolve(process.cwd(), Env.DB_NAME);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DBPATH,
  logging: Env.NODE_ENV === 'development' ? console.log : false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to SQLite Database');
  })
  .catch((error) => console.error('Unable to connect to Database:', error));

export default sequelize;

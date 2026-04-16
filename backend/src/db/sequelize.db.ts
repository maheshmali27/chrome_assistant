import path from 'path';
import { Sequelize } from 'sequelize';

import Env from '../constant/env';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../', Env.DB_NAME),
  logging: Env.NODE_ENV === 'development' ? console.log : false,
});

sequelize
  .authenticate()
  .then(() => console.log('Connected to SQLite Database'))
  .catch((error) => console.error('Unable to connect to Database:', error));

export default sequelize;

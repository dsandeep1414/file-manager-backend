import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize/types';
import { IDatabaseConfig } from './dbConfig.interfaces';

dotenv.config();

export const databaseConfig: IDatabaseConfig = {
  dev: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_DEVELOPMENT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT as Dialect,
  },
  stage: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT as Dialect,
  },
  prod: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_PRODUCTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT as Dialect,
  },
};

import { Sequelize } from 'sequelize-typescript';
//import { Dialect } from 'sequelize/types';
import {
  SEQUELIZE,
  DEVELOPMENT,
  STAGE,
  PRODUCTION,
} from '../../constants/index';
import { databaseConfig } from './database.config';
import { user } from '../../api/users/entities/user.entity';
import { fileManager } from '../../api/file-manager/entities/file-manager.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.dev;
          break;
        case STAGE:
          config = databaseConfig.stage;
          break;
        case PRODUCTION:
          config = databaseConfig.prod;
          break;
        default:
          config = databaseConfig.dev;
      }
      const sequelize = new Sequelize(config);
      if (process.env.NODE_ENV != 'prod') {
        sequelize.addModels([user, fileManager]);
        await sequelize.sync();
      }
      return sequelize;
    },
  },
];

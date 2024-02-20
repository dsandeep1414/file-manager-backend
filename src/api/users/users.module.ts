import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RabbitMqModule } from 'src/common/helper/rabbitmq/rabbit-mq.module';
import { RedisModule } from 'src/common/helper/redis/redis.module';

@Module({
  imports: [RabbitMqModule, RedisModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

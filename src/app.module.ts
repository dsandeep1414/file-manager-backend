import { RateLimiterMiddleware } from './middleware/rateLimiter';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { UsersModule } from './api/users/users.module';
import { HealthModule } from './api/health/health.module';
import { RabbitMqModule } from './common/helper/rabbitmq/rabbit-mq.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from './common/helper/redis/redis.module';
import EscapeXssMiddleware from './middleware/escapeXssMiddleware';
import { SocketModule } from './api/socket/socket.module';
import { FileManagerModule } from './api/file-manager/file-manager.module';
/**
 * @param  {[ConfigModule.forRoot({isGlobal:true}} {imports
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    HealthModule,
    FileManagerModule,
    UsersModule,
    // RabbitMqModule,
    // RedisModule,
    // SocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  /**
   * @param  {MiddlewareConsumer} consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EscapeXssMiddleware, RateLimiterMiddleware).forRoutes('/*');
  }
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/error-handler/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { configSwagger } from './common/helper/swagger/swagger';

async function bootstrap() {
  /**
   * @param  {} AppModule
   */
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice([
    {
      name: 'USER_SERVICES',
      transport: Transport.TCP,
      options: {
        host: process.env.TCP_USER_HOST,
        port: process.env.TCP_USER_PORT,
      },
    },
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
      },
    },
    {
      transport: Transport.REDIS,
      Option: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    },
  ]);

  await app.startAllMicroservices();
  const grpcServer = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'QUEUE_USER',
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api/v1/users');

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * @param  {} app
   * @param  {} configSwagger
   */
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  await grpcServer.listen();
  console.log(`Server running on: http://localhost:${process.env.PORT}`);
}
bootstrap();

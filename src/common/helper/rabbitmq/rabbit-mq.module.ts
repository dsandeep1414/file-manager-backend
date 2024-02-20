import { Module } from '@nestjs/common';
import { RabbitMqService } from './rabbit-mq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_USER',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'QUEUE_USER',
        },
      },
    ]),
  ],
  controllers: [],
  exports: [RabbitMqService],
  providers: [RabbitMqService],
})
export class RabbitMqModule {}

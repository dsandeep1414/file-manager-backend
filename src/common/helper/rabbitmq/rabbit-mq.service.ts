import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMqService {
  constructor(@Inject('RABBITMQ_USER') private readonly client: ClientProxy) {}

  public send(pattern: string, data: any) {
    return this.client.send(pattern, data).subscribe();
  }

  mySuperLongProcessOfUser(data: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`done processing ${JSON.stringify(data)}`);
        resolve(true);
      }, 10000);
    });
  }
}

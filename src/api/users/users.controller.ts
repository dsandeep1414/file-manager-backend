import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  successResponse,
  errorResponse,
} from '../../common/succes-handler/response-handler';
import {
  USER_FOUND,
  USER_CREATED,
  USER_UPDATED,
  USER_DELETED,
} from 'src/constants/message.constant';
import { TransforRequest } from '../../common/transform/transform.request.interceptor';
import { TransformResponse } from 'src/common/transform/transform.response.inceptor';

import {
  MessagePattern,
  RmqContext,
  Ctx,
  Payload,
  RedisContext,
} from '@nestjs/microservices';
import { RabbitMqService } from 'src/common/helper/rabbitmq/rabbit-mq.service';
import { RedisService } from 'src/common/helper/redis/redis.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rabbitMQService: RabbitMqService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  @UseInterceptors(TransforRequest, TransformResponse)
  /**
   * @param  {} @Body(
   * @param  {CreateUserDto} createUserDto
   */
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);
      return successResponse(USER_CREATED('Sandeep'), result);
    } catch (error) {
      return errorResponse(error.message, error);
    }
  }

  @Get()
  /**
   * @param  {} TransforRequest
   * @param  {} TransformResponse
   */
  @UseInterceptors(TransforRequest, TransformResponse)
  async findAll() {
    try {
      const result = await this.usersService.findAll();

      //rabbitMQService
      this.rabbitMQService.send('users_message', {
        message: result,
      });

      //REDIS SET
      await this.redisService.set('redis-1', { name: 'sandeep' }, { ttl: 30 });

      return successResponse(USER_FOUND(10), result);
    } catch (error) {
      return errorResponse(error.message, error);
    }
  }

  @Get(':id')
  /**
   * @param  {} @Param('id'
   * @param  {string} id
   * @param  {} result
   */
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.usersService.findOne(+id);

      //REDIS GET
      const redisData = await this.redisService.get('redis-1');
      console.log('get', redisData);
      return successResponse(USER_FOUND(null), result);
    } catch (error) {
      return errorResponse(error.message, error);
    }
  }

  @Patch(':id')
  /**
   * @param  {} @Param('id'
   * @param  {string} id
   * @param  {} @Body(
   * @param  {UpdateUserDto} updateUserDto
   */
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.usersService.update(+id, updateUserDto);
      return successResponse(USER_UPDATED(+id), result);
    } catch (error) {
      return errorResponse(error.message, error);
    }
  }

  @Delete(':id')
  /**
   * @param  {} @Param('id'
   * @param  {string} id
   */
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.remove(+id);
      return successResponse(USER_DELETED(+id), result);
    } catch (error) {
      return errorResponse(error.message, error);
    }
  }

  //RABBITMQ_SERVICE
  @MessagePattern('users_message')
  /**
   * @param  {} @Payload(
   * @param  {any} data
   * @param  {} @Ctx(
   * @param  {RmqContext} context
   */
  public async execute(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const orginalMessage = context.getMessage();
    console.log('data', data);
    //FROM SERVICE
    await this.rabbitMQService.mySuperLongProcessOfUser(data);
    channel.ack(orginalMessage);
  }
}

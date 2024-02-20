import { BadRequestException, HttpException } from '@nestjs/common';

export const catchAsync = async (fn: any): Promise<any> => {
  return Promise.resolve(fn).catch((err) => {
    console.log(`Error from catchAsync`, err.code, err.detail);
    if (err.code === '23505') {
      const value = err.detail.match(/(["'])(\\?.)*?\1/)[0];
      const message = `Duplicate field value: ${value}. Please use another value!`;
      throw new BadRequestException(message);
    }
    throw new HttpException(err, 400);
  });
};

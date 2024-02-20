import {
  CallHandler,
  NestInterceptor,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encrypt } from '../encrypt-decrypt/encrptdecrypt';
import { successResponse } from '../succes-handler/response-handler';
@Injectable()
export class TransformResponse implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const enable = process.env.ENABLE_ENCRYPTION;
    if (enable === 'YES') {
      let encryptD: any, decryptD: any;
      let message: any;
      const resp = next.handle().forEach(async (val) => {
        encryptD = await encrypt(val.data);
        message = val.message;
      });
      // return next.handle().pipe(
      //   map((data) => ({
      //     statusCode: context.switchToHttp().getResponse().statusCode,
      //     message: encryptD,
      //   })),
      // );
      return next
        .handle()
        .pipe(map((data, index) => successResponse(message, encryptD)));
    }
    if (enable === 'NO') {
      let encryptD: any, decryptD: any;
      let message: any;
      const resp = next.handle().forEach(async (val) => {
        encryptD = val.data;
        message = val.message;
      });
      return next
        .handle()
        .pipe(map((data, index) => successResponse(message, encryptD)));
    }
  }
}

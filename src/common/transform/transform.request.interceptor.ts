import {
  CallHandler,
  NestInterceptor,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { decrypt } from '../encrypt-decrypt/encrptdecrypt';
@Injectable()
export class TransforRequest implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const requestBody = ctx.getRequest()!.body;
    let encryptD: any, decryptD: any;
    if (requestBody.stuff) {
      decryptD = decrypt(requestBody.stuff);
      requestBody.stuff = decryptD;
    }
    return next.handle();
  }
}

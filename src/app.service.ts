import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHelloo() : string{
    return "Hey there i am not hello";
  }
}

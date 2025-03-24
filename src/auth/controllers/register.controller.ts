import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from '../services/register.service';

@Controller('auth/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  async register(
    @Body() body: { firstName: string; lastName: string; username: string; email: string; password: string; profilePictureUrl: string }
  ) {
    console.log(body);
    return this.registerService.register(
      body.firstName, body.lastName, body.username, body.email, body.password, body.profilePictureUrl
    );
  }
}

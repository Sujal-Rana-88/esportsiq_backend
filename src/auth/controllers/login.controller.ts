import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoginService } from '../services/login.service';

@Controller('auth/login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    return this.loginService.validateUser(body.email, body.password);
  }
}

import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { VerifyEmailService } from '../services/verify_email.service';

@Controller('auth/verify-email')
export class VerifyEmailController {
  constructor(private readonly verifyEmailService: VerifyEmailService) {}

  @Post()
  @HttpCode(200)
  async login(@Body() body: { token: string}) {
    return this.verifyEmailService.verifyEmail(body.token);
  }
}
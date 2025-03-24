import { Module } from '@nestjs/common';
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';
import { PasswordService } from './services/password.service';
import { EmailService } from './services/email.service';
import { DatabaseService } from '../database/database.service';

// Import controllers
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { PasswordController } from './controllers/password.controller';
import { VerifyEmailController } from './controllers/verify_email.controller';
import { VerifyEmailService } from './services/verify_email.service';

@Module({
  controllers: [RegisterController, LoginController, PasswordController, VerifyEmailController],
  providers: [RegisterService, LoginService, PasswordService, EmailService, DatabaseService, VerifyEmailService],
  exports: [RegisterService, LoginService, PasswordService, EmailService, VerifyEmailService],
})
export class AuthModule {}

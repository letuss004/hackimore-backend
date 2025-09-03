import * as path from 'node:path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import { EmailService } from 'src/module/base/email.service';
import { HttpService } from 'src/module/base/http.service';
import { DatabaseService } from './database';
import { PermissionService } from './permission.service';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
          user: ServerConfig.get().SMTP_GMAIL_USER,
          pass: ServerConfig.get().SMTP_GMAIL_PASS,
        },
      },
      defaults: {
        replyTo: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: path.join('template'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
      preview: false,
    }),
  ],
  providers: [PermissionService, DatabaseService, EmailService, HttpService],
  exports: [DatabaseService, EmailService, HttpService],
})
export class BaseModule {}

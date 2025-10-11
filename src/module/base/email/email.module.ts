import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ServerConfig } from '@server/config';
import path from 'node:path';
import { EmailService } from './email.service';

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
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

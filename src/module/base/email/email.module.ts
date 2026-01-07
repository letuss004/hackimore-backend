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
        port: 465,
        secure: true,
        auth: {
          user: ServerConfig.get().SMTP_GMAIL_USER,
          pass: ServerConfig.get().SMTP_GMAIL_PASS,
        },
        // Timeout settings for Docker environment
        connectionTimeout: 60000, // 60 seconds to establish connection
        greetingTimeout: 30000, // 30 seconds to receive server greeting
        socketTimeout: 60000, // 60 seconds for socket inactivity
        // Connection pool for better performance
        pool: true,
        maxConnections: 5,
        maxMessages: 10,
        // Retry logic
        requireTLS: true,
        tls: {
          rejectUnauthorized: false, // For Docker network compatibility
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

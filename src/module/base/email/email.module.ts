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
        host: 'smtp.gmail.com',
        port: 587, // Use port 587 with STARTTLS instead of 465 (better Docker compatibility)
        secure: false, // false for port 587, true for 465
        auth: {
          user: ServerConfig.get().SMTP_GMAIL_USER,
          pass: ServerConfig.get().SMTP_GMAIL_PASS,
        },
        // More lenient timeout settings for Docker environment
        connectionTimeout: 120000, // 120 seconds to establish connection
        greetingTimeout: 60000, // 60 seconds to receive server greeting
        socketTimeout: 120000, // 120 seconds for socket inactivity
        // Connection pool for better performance
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        // TLS settings
        requireTLS: true,
        tls: {
          rejectUnauthorized: false, // For Docker network compatibility
          minVersion: 'TLSv1.2',
          ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
        },
        // Additional options for Docker
        logger: false,
        debug: false,
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

/**
 * Example: How to use ServerConfig Hybrid Approach
 *
 * This file demonstrates the recommended way to use ServerConfig
 * in a NestJS application with the hybrid approach.
 */

// ============================================================================
// Step 1: Create your config files
// ============================================================================

// config/server-config.ts
const MAIN_CONFIG = {
  SERVER_PORT: +process.env.SERVER_PORT,
  API_PREFIX: process.env.API_PREFIX,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: +process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  // ... other env variables
};

// config/default-config.ts
import { NodeEnv } from 'server-core';

const DEFAULT_CONFIG = {
  SERVER_PORT: 3000,
  API_PREFIX: '/api',
  NODE_ENV: NodeEnv.Development,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: undefined,
  JWT_SECRET: 'default-secret-do-not-use-in-production',
  // ... default values for all MAIN_CONFIG keys
};

// ============================================================================
// Step 2: Initialize in main.ts (before NestJS)
// ============================================================================

/*
// main.ts
import { NestFactory } from '@nestjs/core';
import { ServerConfig, ServerLogger } from 'server-core';
import MAIN_CONFIG from './config/server-config';
import DEFAULT_CONFIG from './config/default-config';
import { AppModule } from './module/app.module';

// Initialize ServerConfig FIRST (before NestJS bootstrap)
ServerConfig.init({
  mainConfig: MAIN_CONFIG,
  defaultConfig: DEFAULT_CONFIG,
});

async function bootstrap() {
  // Now you can use ServerConfig anywhere
  const { SERVER_PORT, API_PREFIX, NODE_ENV } = ServerConfig.get();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PREFIX);

  await app.listen(SERVER_PORT);
  ServerLogger.info({
    context: 'Bootstrap',
    message: `Server running on port ${SERVER_PORT} in ${NODE_ENV} mode`,
  });
}

bootstrap();
*/

// ============================================================================
// Step 3: Register ServerConfigModule in AppModule
// ============================================================================

/*
// app.module.ts
import { Module } from '@nestjs/common';
import { ServerConfigModule } from 'server-core';
import MAIN_CONFIG from '../config/server-config';
import DEFAULT_CONFIG from '../config/default-config';

@Module({
  imports: [
    // ServerConfigModule will detect that ServerConfig is already initialized
    // and reuse the existing configuration
    ServerConfigModule.forRoot({
      mainConfig: MAIN_CONFIG,
      defaultConfig: DEFAULT_CONFIG,
    }),
    // ... other modules
  ],
})
export class AppModule {}
*/

// ============================================================================
// Step 4: Use in Services via Dependency Injection
// ============================================================================

/*
// database.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServerConfigService, DatabaseCredentials } from 'server-core';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private credentials: DatabaseCredentials;

  constructor(private readonly configService: ServerConfigService) {}

  onModuleInit() {
    // Access config through DI
    this.credentials = this.configService.getDatabaseCredentials();
    console.log(`Connecting to database: ${this.credentials.database}`);
  }

  getConnection() {
    return {
      host: this.credentials.host,
      port: this.credentials.port,
      user: this.credentials.user,
      password: this.credentials.password,
      database: this.credentials.database,
    };
  }
}
*/

// ============================================================================
// Step 5: Use Static Methods for Quick Access
// ============================================================================

/*
// redis.config.ts (for external configuration files)
import { ServerConfig } from 'server-core';

export const getRedisConfig = () => {
  const { host, port, password } = ServerConfig.getRedisCredentials();
  return {
    host,
    port,
    password,
    retryDelays: [1000, 3000, 5000],
  };
};
*/

// ============================================================================
// Step 6: Environment-specific logic
// ============================================================================

/*
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ServerConfigService, NodeEnv } from 'server-core';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly configService: ServerConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (this.configService.isLocalEnv()) {
      // Log detailed info in local environment
      console.log(`[${req.method}] ${req.url}`);
    }

    if (this.configService.isEnv(NodeEnv.Development)) {
      // Development-specific logic
    }

    next();
  }
}
*/

// ============================================================================
// Benefits of Hybrid Approach
// ============================================================================

/**
 * 1. EARLY ACCESS
 *    - Can use config before NestJS bootstrap
 *    - Perfect for setting up logger, database connections, etc.
 *
 * 2. TESTABILITY
 *    - ServerConfigService can be mocked in unit tests
 *    - ServerConfig.reset() allows resetting between tests
 *
 * 3. TYPE SAFETY
 *    - Generic support: ServerConfig<MyConfigType>
 *    - Compile-time checking for config keys
 *
 * 4. FLEXIBILITY
 *    - Use static methods for quick access
 *    - Use DI for proper dependency management in services
 *
 * 5. SINGLE SOURCE OF TRUTH
 *    - Both approaches share the same configuration
 *    - No duplication or sync issues
 *
 * 6. NESTJS LIFECYCLE HOOKS
 *    - ServerConfigService implements OnModuleInit
 *    - Can hook into NestJS lifecycle for initialization logic
 */

export { };


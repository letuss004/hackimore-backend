import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ServerConfig } from '@server-core/config/index';
import { NodeEnv } from '@server-core/platform';
import { SERVER_CONFIG_OPTIONS } from './config.constant';
import {
  DatabaseCredentials,
  PackageJson,
  RedisCredentials,
  ServerConfigOptions,
} from './config.type';

/**
 * Injectable service for accessing configuration in NestJS.
 * Provides a clean API for dependency injection while leveraging
 * the same underlying configuration.
 *
 * @example
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly configService: ServerConfigService) {}
 *
 *   someMethod() {
 *     const port = this.configService.get('SERVER_PORT');
 *     const isProduction = this.configService.isProductionEnv();
 *   }
 * }
 */
@Injectable()
export class ServerConfigService<TConfig = Record<string, any>> implements OnModuleInit {
  private readonly serverConfig: ServerConfig<TConfig>;

  constructor(
    @Inject(SERVER_CONFIG_OPTIONS)
    private readonly options: ServerConfigOptions<TConfig>,
  ) {
    // If global singleton is already initialized, use it
    // Otherwise, create a new instance and optionally sync to global
    if (ServerConfig.isInitialized()) {
      // Create instance that wraps the existing global config
      this.serverConfig = new ServerConfig(options);
    } else {
      // Initialize global singleton through this service
      this.serverConfig = ServerConfig.init(options);
    }
  }

  onModuleInit(): void {
    // Lifecycle hook - can be used for additional initialization
    // e.g., logging, metrics, etc.
  }

  /**
   * Get the entire configuration object
   */
  getAll(): TConfig {
    return this.serverConfig.getConfig();
  }

  /**
   * Get a specific configuration value by key
   */
  get<K extends keyof TConfig>(key: K): TConfig[K] {
    return this.serverConfig.getValue(key);
  }

  /**
   * Get package.json information
   */
  getPackageJson(): PackageJson {
    return this.serverConfig.getPackageJson();
  }

  /**
   * Get Redis credentials
   */
  getRedisCredentials(): RedisCredentials {
    return this.serverConfig.getRedisCredentials();
  }

  /**
   * Get database credentials
   */
  getDatabaseCredentials(): DatabaseCredentials {
    return this.serverConfig.getDatabaseCredentials();
  }

  /**
   * Get Prisma log levels
   */
  getPrismaLogLevel(): Prisma.LogLevel[] {
    return this.serverConfig.getPrismaLogLevel();
  }

  /**
   * Check if current environment is local
   */
  isLocalEnv(): boolean {
    return this.serverConfig.isLocalEnv();
  }

  /**
   * Check if current environment is production
   */
  isProductionEnv(): boolean {
    return this.serverConfig.isProductionEnv();
  }

  /**
   * Check if current environment matches the given environment
   */
  isEnv(env: NodeEnv): boolean {
    return (this.serverConfig.getConfig() as any).NODE_ENV === env;
  }
}

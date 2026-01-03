import { Joi } from '@server-core/libs/joi';

/**
 * Configuration options for ServerConfig initialization
 */
export interface ServerConfigOptions<TConfig = Record<string, any>> {
  /**
   * Main configuration object from user's project
   * This contains environment-specific values
   */
  mainConfig: TConfig;

  /**
   * Default configuration object from user's project
   * This contains fallback/default values
   */
  defaultConfig: Partial<TConfig>;

  /**
   * Optional: Path to package.json (defaults to 'package.json' in cwd)
   */
  packageJsonPath?: string;

  /**
   * Optional: Custom environment validation schema
   */
  envValidationSchema?: Joi.ObjectSchema;
}

/**
 * Async configuration options for ServerConfigModule.forRootAsync()
 */
export interface ServerConfigAsyncOptions<TConfig = Record<string, any>> {
  /**
   * Optional imports for the module
   */
  imports?: any[];

  /**
   * Factory function to create configuration options
   */
  useFactory: (...args: any[]) => Promise<ServerConfigOptions<TConfig>> | ServerConfigOptions<TConfig>;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];
}

/**
 * Package.json structure
 */
export interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

/**
 * Redis credentials structure
 */
export interface RedisCredentials {
  host: string;
  port: number;
  password: string | undefined;
}

/**
 * Database credentials structure
 */
export interface DatabaseCredentials {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
}

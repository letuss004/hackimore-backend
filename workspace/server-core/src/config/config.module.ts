import { ServerConfig } from ".";
import { DynamicModule, Global, Module } from '@nestjs/common';
import { SERVER_CONFIG, SERVER_CONFIG_OPTIONS } from '@server-core/config/config.constant';
import { ServerConfigService } from '@server-core/config/config.service';
import {
  ServerConfigAsyncOptions,
  ServerConfigOptions,
} from '@server-core/config/config.type';
import 'dotenv/config.js';


/**
 * NestJS module for configuration management.
 * Provides both sync and async initialization options.
 *
 * @example
 * // Sync initialization
 * @Module({
 *   imports: [
 *     ServerConfigModule.forRoot({
 *       mainConfig: MAIN_CONFIG,
 *       defaultConfig: DEFAULT_CONFIG,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * @example
 * // Async initialization (e.g., loading from external service)
 * @Module({
 *   imports: [
 *     ServerConfigModule.forRootAsync({
 *       imports: [HttpModule],
 *       inject: [HttpService],
 *       useFactory: async (httpService: HttpService) => {
 *         const config = await httpService.get('/config').toPromise();
 *         return {
 *           mainConfig: config.data,
 *           defaultConfig: DEFAULT_CONFIG,
 *         };
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 */
@Global()
@Module({})
export class ServerConfigModule {
  /**
   * Synchronous module initialization
   */
  static forRoot<TConfig = Record<string, any>>(
    options: ServerConfigOptions<TConfig>,
  ): DynamicModule {
    return {
      module: ServerConfigModule,
      providers: [
        {
          provide: SERVER_CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: SERVER_CONFIG,
          useFactory: () => {
            if (ServerConfig.isInitialized()) {
              return ServerConfig.get<TConfig>();
            }
            return ServerConfig.init(options).getConfig();
          },
        },
        ServerConfigService,
      ],
      exports: [SERVER_CONFIG_OPTIONS, SERVER_CONFIG, ServerConfigService],
    };
  }

  /**
   * Asynchronous module initialization
   */
  static forRootAsync<TConfig = Record<string, any>>(
    options: ServerConfigAsyncOptions<TConfig>,
  ): DynamicModule {
    return {
      module: ServerConfigModule,
      imports: options.imports || [],
      providers: [
        {
          provide: SERVER_CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: SERVER_CONFIG,
          useFactory: (configOptions: ServerConfigOptions<TConfig>) => {
            if (ServerConfig.isInitialized()) {
              return ServerConfig.get<TConfig>();
            }
            return ServerConfig.init(configOptions).getConfig();
          },
          inject: [SERVER_CONFIG_OPTIONS],
        },
        ServerConfigService,
      ],
      exports: [SERVER_CONFIG_OPTIONS, SERVER_CONFIG, ServerConfigService],
    };
  }
}

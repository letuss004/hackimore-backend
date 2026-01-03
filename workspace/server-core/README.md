# Server Core

Core utilities and shared modules for the Hackimore backend server.

## Structure

```
src/
├── async-storage/   # Async local storage utilities
├── config/          # ServerConfig with Hybrid Approach
├── errors/          # Custom error classes
├── libs/            # Third-party library wrappers
├── logger/          # Logger utilities
├── pipe/            # NestJS pipes
├── platform/        # Platform-specific utilities
└── index.ts         # Main entry point
```

## ServerConfig - Hybrid Approach

ServerConfig cung cấp 2 cách sử dụng:

### 1. Global Singleton (Early Access - Before NestJS Bootstrap)

Sử dụng khi cần config trước khi NestJS khởi động:

```typescript
// main.ts
import { ServerConfig } from 'server-core';
import MAIN_CONFIG from './config/server-config';
import DEFAULT_CONFIG from './config/default-config';

// Initialize once at app startup (before NestJS)
ServerConfig.init({
  mainConfig: MAIN_CONFIG,
  defaultConfig: DEFAULT_CONFIG,
});

// Use anywhere in the app
const port = ServerConfig.get().SERVER_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
```

### 2. NestJS DI Integration (Recommended for Services)

Sử dụng trong các NestJS services với dependency injection:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ServerConfigModule } from 'server-core';
import MAIN_CONFIG from './config/server-config';
import DEFAULT_CONFIG from './config/default-config';

@Module({
  imports: [
    ServerConfigModule.forRoot({
      mainConfig: MAIN_CONFIG,
      defaultConfig: DEFAULT_CONFIG,
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

```typescript
// my.service.ts
import { Injectable } from '@nestjs/common';
import { ServerConfigService } from 'server-core';

@Injectable()
export class MyService {
  constructor(private readonly configService: ServerConfigService) {}

  someMethod() {
    // Type-safe access
    const port = this.configService.get('SERVER_PORT');
    const isProduction = this.configService.isProductionEnv();
    const redisCredentials = this.configService.getRedisCredentials();
  }
}
```

### 3. Hybrid Usage (Recommended)

Kết hợp cả 2 approaches để có tối đa flexibility:

```typescript
// main.ts - Early initialization
import { ServerConfig } from 'server-core';
import MAIN_CONFIG from './config/server-config';
import DEFAULT_CONFIG from './config/default-config';

// Initialize before NestJS
const serverConfig = ServerConfig.init({
  mainConfig: MAIN_CONFIG,
  defaultConfig: DEFAULT_CONFIG,
});

// Use before NestJS starts
const port = ServerConfig.get().SERVER_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ...app configuration using ServerConfig.get()
  
  await app.listen(port);
}
```

```typescript
// app.module.ts - Register with NestJS DI
import { ServerConfigModule } from 'server-core';

@Module({
  imports: [
    // Module sẽ tự detect ServerConfig đã init và sử dụng lại
    ServerConfigModule.forRoot({
      mainConfig: MAIN_CONFIG,
      defaultConfig: DEFAULT_CONFIG,
    }),
  ],
})
export class AppModule {}
```

### API Reference

#### Static Methods (Global Singleton)

| Method | Description |
|--------|-------------|
| `ServerConfig.init(options)` | Initialize global singleton |
| `ServerConfig.get<T>()` | Get entire config object |
| `ServerConfig.isInitialized()` | Check if initialized |
| `ServerConfig.getPackageJson()` | Get package.json info |
| `ServerConfig.getRedisCredentials()` | Get Redis connection info |
| `ServerConfig.getDatabaseCredentials()` | Parse DATABASE_URL |
| `ServerConfig.isLocalEnv()` | Check if NODE_ENV is local |
| `ServerConfig.isProductionEnv()` | Check if NODE_ENV is production |
| `ServerConfig.reset()` | Reset singleton (for testing) |

#### ServerConfigService (NestJS DI)

| Method | Description |
|--------|-------------|
| `getAll()` | Get entire config object |
| `get(key)` | Get specific config value |
| `getPackageJson()` | Get package.json info |
| `getRedisCredentials()` | Get Redis connection info |
| `getDatabaseCredentials()` | Parse DATABASE_URL |
| `isLocalEnv()` | Check if NODE_ENV is local |
| `isProductionEnv()` | Check if NODE_ENV is production |
| `isEnv(env)` | Check specific environment |

## Development

```bash
# Build the package
yarn build

# Watch mode
yarn build:watch
```


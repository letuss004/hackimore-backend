# Server Core

Core utilities and shared modules for the Hackimore backend server.

## Structure

```
src/
├── async-storage/   # Async local storage utilities
├── config/          # Configuration utilities
├── errors/          # Custom error classes
├── libs/            # Third-party library wrappers
├── logger/          # Logger utilities
├── pipe/            # NestJS pipes
├── platform/        # Platform-specific utilities
└── index.ts         # Main entry point
```

## Usage

```typescript
import { Logger, UnexpectedError, ValidationError } from 'server-core';
```

## Development

```bash
# Build the package
yarn build

# Watch mode
yarn build:watch
```


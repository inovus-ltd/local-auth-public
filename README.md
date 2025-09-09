# Local Auth Public

A simple test package for demonstrating git repository installation.

## Installation

```bash
npm install git+https://github.com/your-username/local-auth-public.git
```

## Usage

```typescript
import { initializeLocalAuth, testLocalAuth, getDefaultConfig } from '@inovus-ltd/local-auth-public';

// Initialize with custom config
initializeLocalAuth({
  apiUrl: 'https://api.example.com',
  timeout: 5000
});

// Test the package
console.log(testLocalAuth());

// Or use default config
const defaultConfig = getDefaultConfig();
initializeLocalAuth(defaultConfig);
```

## API

### Functions

- `initializeLocalAuth(config: LocalAuthConfig)`: Initialize the local auth service
- `testLocalAuth()`: Test function that returns a success message
- `getDefaultConfig()`: Get a default configuration object

### LocalAuthConfig

Configuration interface for the local auth functions.

```typescript
interface LocalAuthConfig {
  apiUrl: string;
  timeout?: number;
}
```

## Development

This is a test package created to verify git repository installation works correctly.

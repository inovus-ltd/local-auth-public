/**
 * Local Auth Public Package
 * A simple test package for git repository installation testing
 */

export interface LocalAuthConfig {
  apiUrl: string;
  timeout?: number;
}

/**
 * Initialize the local auth service
 */
export function initializeLocalAuth(config: LocalAuthConfig): void {
  console.log('Local Auth initialized with config:', config);
}

/**
 * Test function to verify the package is working
 */
export function testLocalAuth(): string {
  return 'Local Auth Public package is working!';
}

/**
 * Get a default configuration
 */
export function getDefaultConfig(): LocalAuthConfig {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000
  };
}

// Default export
export default {
  initializeLocalAuth,
  testLocalAuth,
  getDefaultConfig
};

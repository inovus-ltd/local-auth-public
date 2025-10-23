# Local Auth Public

A comprehensive authentication package with React components and services for modern web applications.

## Installation

```bash
npm install git+https://github.com/your-username/local-auth-public.git
```

## Features

- 🔐 Complete authentication system with login/logout
- ⚛️ React Context for state management
- 🛡️ Protected route component
- 🎨 Beautiful, responsive login UI
- 🔄 Token management with automatic refresh
- 📡 Authenticated API fetch hooks
- 🎯 TypeScript support
- 🎨 Tailwind CSS styling

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import React from 'react';
import { AuthProvider } from '@inovus-ltd/local-auth-public';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use the LoginPage component

```tsx
import { LoginPage } from '@inovus-ltd/local-auth-public';

// In your routing setup
<Route path="/login" element={<LoginPage />} />
```

### 3. Protect routes with ProtectedRoute

```tsx
import { ProtectedRoute } from '@inovus-ltd/local-auth-public';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 4. Use authentication in components

```tsx
import { useAuth, useAuthenticatedFetch } from '@inovus-ltd/local-auth-public';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const fetchData = async () => {
    const response = await authenticatedFetch('/data'); // Note: no '/api' prefix needed
    return response.json();
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.fullName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## API Reference

### Components

#### `AuthProvider`
React context provider that manages authentication state.

```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

#### `LoginPage`
Beautiful, responsive login page component with video background.

```tsx
<LoginPage />
```

#### `ProtectedRoute`
Route wrapper that redirects unauthenticated users to login.

```tsx
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

### Hooks

#### `useAuth()`
Hook to access authentication state and methods.

```tsx
const { 
  user,           // Current user object
  isAuthenticated, // Boolean authentication status
  isLoading,      // Loading state
  login,          // Login function
  logout          // Logout function
} = useAuth();
```

#### `useAuthenticatedFetch(options?)`
Hook for making authenticated API requests. Uses `/api` as the default base URL.

```tsx
const { authenticatedFetch } = useAuthenticatedFetch({
  baseUrl: '/api' // Optional, defaults to '/api'
});

// Usage
const response = await authenticatedFetch('/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### `useApiData()`
Pre-configured hook with common API endpoints.

```tsx
const { fetchUserProfile, fetchDashboardData } = useApiData();
```

### Services

#### `authService`
Core authentication service with methods for login, logout, and token management.

```tsx
import { authService } from '@inovus-ltd/local-auth-public';

// Login
await authService.login(email, password);

// Check authentication
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getUser();

// Logout
authService.logout();

// Make authenticated requests
const response = await authService.authFetch('/api/endpoint');
```

### Types

```tsx
interface User {
  id: string;
  email: string;
  fullName?: string;
  systemId?: string;
  roleGroups?: string[];
}

interface LoginRequest {
  login: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

## Configuration

The package uses relative URLs (`/api`) for maximum flexibility. Parent applications must configure their development server or proxy to handle API routing.

### Vite Configuration

For Vite-based applications, configure the proxy in your `vite.config.js`:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target: "https://sandbox.totum.surgery", // or dev.totum.surgery, staging.totum.surgery
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
};
```

### Environment-Specific Configuration

You can configure different environments by changing the proxy target:

```javascript
// Example
target: "https://example.totum.surgery"

### Non-Vite Applications

For applications not using Vite, configure your development server to proxy `/api` requests to the appropriate backend environment.

## Benefits of Relative URL Approach

✅ **Environment Flexibility**: Parent apps control which backend environment to use  
✅ **No Hardcoded URLs**: The npm module doesn't contain environment-specific URLs  
✅ **Easy Configuration**: Simple proxy setup handles all environment switching  
✅ **Development Friendly**: Works seamlessly with Vite's proxy system  
✅ **Production Ready**: Parent apps can configure their production servers as needed

## Styling

The package uses Tailwind CSS for styling. Make sure to include Tailwind CSS in your project:

```bash
npm install tailwindcss
```


## Development

This package provides a complete authentication solution for React applications with a modern, beautiful UI and comprehensive TypeScript support.

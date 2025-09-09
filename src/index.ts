/**
 * Local Auth Public Package
 * A comprehensive authentication package with React components and services
 */

// Import Tailwind CSS styles
import './styles.css';

// Types
export type { 
  LoginRequest, 
  LoginResponse, 
  User, 
  AuthContextType, 
  UseAuthenticatedFetchOptions 
} from './types/auth';

// Services
export { authService } from './services/authService';

// React Context
export { AuthProvider, useAuth } from './contexts/AuthContext';

// React Components
export { default as LoginPage } from './components/LoginPage';
export { default as ProtectedRoute } from './components/ProtectedRoute';

// React Hooks
export { useAuthenticatedFetch, useApiData } from './hooks/useAuthenticatedFetch';

// Import for default export
import { authService } from './services/authService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthenticatedFetch, useApiData } from './hooks/useAuthenticatedFetch';


// Create a proper type for the default export
interface LocalAuthPublic {
  // Auth functionality
  AuthProvider: typeof AuthProvider;
  useAuth: typeof useAuth;
  authService: typeof authService;
  LoginPage: typeof LoginPage;
  ProtectedRoute: typeof ProtectedRoute;
  useAuthenticatedFetch: typeof useAuthenticatedFetch;
  useApiData: typeof useApiData;
}

// Default export
const localAuthPublic: LocalAuthPublic = {
  // Auth functionality
  AuthProvider,
  useAuth,
  authService,
  LoginPage,
  ProtectedRoute,
  useAuthenticatedFetch,
  useApiData,
};

export default localAuthPublic;

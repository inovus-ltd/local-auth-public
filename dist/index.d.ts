import { authService } from './services/authService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { default as LoginPage } from './components/LoginPage';
import { default as ProtectedRoute } from './components/ProtectedRoute';
import { useAuthenticatedFetch, useApiData } from './hooks/useAuthenticatedFetch';
export type { LoginRequest, LoginResponse, User, AuthContextType, UseAuthenticatedFetchOptions } from './types/auth';
export { authService } from './services/authService';
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { default as LoginPage } from './components/LoginPage';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { useAuthenticatedFetch, useApiData } from './hooks/useAuthenticatedFetch';
interface LocalAuthPublic {
    AuthProvider: typeof AuthProvider;
    useAuth: typeof useAuth;
    authService: typeof authService;
    LoginPage: typeof LoginPage;
    ProtectedRoute: typeof ProtectedRoute;
    useAuthenticatedFetch: typeof useAuthenticatedFetch;
    useApiData: typeof useApiData;
}
declare const localAuthPublic: LocalAuthPublic;
export default localAuthPublic;
//# sourceMappingURL=index.d.ts.map
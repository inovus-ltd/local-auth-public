import { LoginResponse, User } from '../types/auth';
export type { User };
declare class AuthService {
    private readonly API_BASE_URL;
    private readonly ACCESS_TOKEN_KEY;
    private readonly REFRESH_TOKEN_KEY;
    private readonly USER_KEY;
    /**
     * Get API base URL based on environment
     */
    private getApiBaseUrl;
    /**
     * Check if we're in development mode
     */
    private isDevelopment;
    /**
     * Login user with email and password
     */
    login(email: string, password: string): Promise<LoginResponse>;
    /**
     * Logout user and clear all stored data
     */
    logout(): void;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get access token from storage
     */
    getAccessToken(): string | null;
    /**
     * Get refresh token from storage
     */
    getRefreshToken(): string | null;
    /**
     * Get user data from storage
     */
    getUser(): User | null;
    /**
     * Store tokens in localStorage
     */
    private setTokens;
    /**
     * Store user data in localStorage
     */
    private setUser;
    /**
     * Check if token is expired (basic JWT check)
     */
    private isTokenExpired;
    /**
     * Make authenticated API request
     */
    authFetch(url: string, options?: RequestInit): Promise<Response>;
    /**
     * Refresh access token using refresh token
     * Note: This would need to be implemented if the API supports token refresh
     */
    refreshToken(): Promise<boolean>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map
import { LoginResponse, User } from '../types/auth';

// Re-export User type for convenience
export type { User };

class AuthService {
  // Use direct API URL for production, proxy for development
  private readonly API_BASE_URL = this.getApiBaseUrl();
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly ID_TOKEN_KEY = "idToken";
  private readonly USER_KEY = "user";

  /**
   * Get API base URL - always use relative URL for proxy support
   */
  private getApiBaseUrl(): string {
    // For non-Vite environments, still use relative URL
    // The parent app should handle routing via proxy or server configuration
    return "/api";
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopment(): boolean {
    try {
      // @ts-ignore - import.meta.env is available in Vite but not in TypeScript definitions
      if (typeof import.meta !== "undefined" && import.meta.env) {
        // @ts-ignore
        return import.meta.env.DEV;
      }
    } catch (e) {
      // Ignore errors if import.meta is not available
    }
    return false;
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log(
        "AuthService: Making login request to:",
        `${this.API_BASE_URL}/Account/Login`
      );
      console.log("AuthService: Environment:", {
        isDev: this.isDevelopment(),
        apiUrl: this.API_BASE_URL,
      });
      console.log("AuthService: Request payload:", {
        login: email,
        password: "***",
      });

      const response = await fetch(`${this.API_BASE_URL}/Account/Login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // No credentials required
        body: JSON.stringify({
          login: email,
          password,
        }),
      });

      console.log("AuthService: Response status:", response.status);
      console.log(
        "AuthService: Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorMessage = `Login failed with status ${response.status}`;
        try {
          const errorText = await response.text();
          console.error("AuthService: Error response body:", errorText);

          // Try to parse as JSON for better error messages
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage =
              errorJson.message || errorJson.error || errorText || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error("AuthService: Could not read error response:", e);
        }

        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("AuthService: Raw response text:", responseText);

      let data: LoginResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "AuthService: Failed to parse response as JSON:",
          parseError
        );
        throw new Error("Invalid response format from server");
      }

      console.log("AuthService: Parsed response data:", data);

      if (!data?.value?.accessToken) {
        console.error("AuthService: No access token in response:", data);
        throw new Error("Invalid response: No access token received");
      }

      // Create user object from the response structure
      const user: User = {
        id: data.value.userId,
        email: email, // Use the email from login since it's not in the response
        fullName: data.value.fullName,
        systemId: data.value.systemId,
        roleGroups: data.value.roleGroups,
      };

      // Store tokens and user data
      this.setTokens(
        data.value.accessToken,
        data.value.refreshToken,
        data.value.idToken
      );
      this.setUser(user);

      console.log("AuthService: Login successful, tokens and user data stored");
      return data;
    } catch (error) {
      console.error("AuthService: Login error:", error);
      throw error;
    }
  }

  /**
   * Logout user and clear all stored data
   */
  logout(): void {
    console.log("AuthService: Logging out user");
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    const isAuth = !!token && !!user && !this.isTokenExpired(token);
    console.log("AuthService: isAuthenticated check:", {
      hasToken: !!token,
      hasUser: !!user,
      isExpired: token ? this.isTokenExpired(token) : "no token",
      result: isAuth,
    });
    return isAuth;
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get id token from storage
   */
  getIdToken(): string | null {
    return localStorage.getItem(this.ID_TOKEN_KEY);
  }

  /**
   * Get user data from storage
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(
    accessToken: string,
    refreshToken: string,
    idToken: string
  ): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.ID_TOKEN_KEY, idToken);
    console.log("AuthService: Tokens stored in localStorage");
  }

  /**
   * Store user data in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log("AuthService: User data stored:", user);
  }

  /**
   * Check if token is expired (basic JWT check)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      console.log("AuthService: Token expiration check:", {
        expired: isExpired,
        exp: payload.exp,
        now: currentTime,
        timeLeft: payload.exp - currentTime,
      });
      return isExpired;
    } catch (error) {
      console.error("AuthService: Error checking token expiration:", error);
      return true; // If we can't parse it, consider it expired
    }
  }

  /**
   * Make authenticated API request
   */
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error("No access token available");
    }

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle token expiration
    if (response.status === 401) {
      console.warn("AuthService: Token expired, clearing auth data");
      this.logout();
      throw new Error("Authentication expired");
    }

    return response;
  }

  /**
   * Refresh access token using refresh token
   * Note: This would need to be implemented if the API supports token refresh
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      // This endpoint would need to be confirmed with your API
      const response = await fetch(
        `${this.API_BASE_URL}/Account/RefreshToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data?.value?.accessToken) {
        this.setTokens(
          data.value.accessToken,
          data.value.refreshToken || refreshToken,
          data.value.idToken
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("AuthService: Token refresh failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

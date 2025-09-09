export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  value: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    idToken: string;
    fullName: string;
    systemId: string;
    roleGroups: string[];
  };
  errors: any[];
  warnings: any[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role?: string;
  systemId?: string;
  roleGroups?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface UseAuthenticatedFetchOptions {
  baseUrl?: string;
}

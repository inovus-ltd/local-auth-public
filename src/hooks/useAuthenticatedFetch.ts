import { useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { UseAuthenticatedFetchOptions } from '../types/auth';

/**
 * Get default base URL - always use relative URL for proxy support
 */
function getDefaultBaseUrl(): string {
  // For non-Vite environments, still use relative URL
  // The parent app should handle routing via proxy or server configuration
  return "/api";
}

export const useAuthenticatedFetch = (options: UseAuthenticatedFetchOptions = {}) => {
  const { logout } = useAuth();
  // Use direct API URL for production, proxy for development
  const { baseUrl = getDefaultBaseUrl() } = options;

  const authenticatedFetch = useCallback(async (
    endpoint: string,
    requestOptions: RequestInit = {}
  ): Promise<Response> => {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      return await authService.authFetch(url, requestOptions);
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication expired') {
        logout();
      }
      throw error;
    }
  }, [baseUrl, logout]);

  return { authenticatedFetch };
};

// Example usage hook for a specific API endpoint
export const useApiData = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/User/Profile');
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }, [authenticatedFetch]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/Dashboard/Data');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }, [authenticatedFetch]);

  return {
    fetchUserProfile,
    fetchDashboardData,
  };
};

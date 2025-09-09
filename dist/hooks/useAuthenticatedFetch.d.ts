import { UseAuthenticatedFetchOptions } from '../types/auth';
export declare const useAuthenticatedFetch: (options?: UseAuthenticatedFetchOptions) => {
    authenticatedFetch: (endpoint: string, requestOptions?: RequestInit) => Promise<Response>;
};
export declare const useApiData: () => {
    fetchUserProfile: () => Promise<any>;
    fetchDashboardData: () => Promise<any>;
};
//# sourceMappingURL=useAuthenticatedFetch.d.ts.map
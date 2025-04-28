import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error: ApiError = new Error();
    error.status = res.status;
    
    try {
      const data = await res.json();
      error.message = data.message || res.statusText;
      error.code = data.code;
    } catch {
      error.message = res.statusText;
    }
    
    throw error;
  }
}

function normalizeEndpoint(endpoint: string): string {
  // Remove leading /api if already present (to avoid /api/api)
  let normalized = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
  // Ensure endpoint starts with a single slash
  if (!normalized.startsWith('/')) normalized = '/' + normalized;
  // Always return with a single /api prefix
  return '/api' + normalized;
}

export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  console.log('apiRequest URL:', url, 'endpoint:', endpoint, 'normalizedEndpoint:', normalizedEndpoint, 'API_BASE_URL:', API_BASE_URL);
  
  // Simplified headers for development
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  try {
    // Use mode: 'cors' explicitly and don't require credentials for GET requests
    const fetchOptions: RequestInit = {
      method,
      headers,
      mode: 'cors',
      credentials: method.toUpperCase() === 'GET' ? 'same-origin' : 'include',
    };
    
    // Only add body for non-GET requests
    if (data && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, fetchOptions);

    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        // Remove automatic redirect to login. Let UI handle booking errors.
        // window.location.href = '/login';
      }
      throw apiError;
    }
    throw error;
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as ApiError;
        if (apiError.status === 401 && unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: (failureCount, error) => {
        const apiError = error as ApiError;
        // Don't retry on 401 or 403
        if (apiError.status === 401 || apiError.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

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
  // Ensure endpoint starts with a single slash
  let normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Always return with a single /api prefix
  return '/api' + normalized;
}

export const apiRequest = async (method: string, endpoint: string, data?: any, headers?: Record<string, string>) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  let url = `${API_BASE_URL}${normalizedEndpoint}`;
  console.log('apiRequest URL:', url, 'endpoint:', endpoint, 'normalizedEndpoint:', normalizedEndpoint, 'API_BASE_URL:', API_BASE_URL);
  
  console.log(`API Request: ${method} ${url}`);
  
  // For get requests with data, convert to query params
  if (data && (method === 'GET' || method === 'HEAD')) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url = `${url}?${params.toString()}`;
  }
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const requestOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...(headers || {}) },
    credentials: 'include', // Important for sessions
  };
  
  if (data && method !== 'GET' && method !== 'HEAD') {
    requestOptions.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Sending ${method} request to ${url}`);
    const response = await fetch(url, requestOptions);
    
    // Log API response for debugging
    console.log(`API Response (${response.status}):`, url);
    
    // Extra debug info for non-ok responses
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.clone().json();
          console.error('Error details:', errorData);
        }
      } catch (e) {
        console.error('Could not parse error response body');
      }
    }
    
    // Return the response object for handling by the caller
    return response;
  } catch (error) {
    console.error(`API Request failed: ${method} ${url}`, error);
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

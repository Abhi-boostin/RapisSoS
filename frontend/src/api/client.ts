import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle error format
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      throw new Error(JSON.stringify({
        message: response.data.message || 'Unknown error',
        code: response.data.code,
        status: response.status,
      }));
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.success === false) {
      throw new Error(JSON.stringify({
        message: error.response.data.message || 'Network error',
        code: error.response.data.code,
        status: error.response.status,
      }));
    }
    throw new Error(JSON.stringify({
      message: error.message || 'Network error',
      code: null,
      status: error.response?.status || 500,
    }));
  }
);

export interface APIError {
  message: string;
  code?: number;
  status: number;
}

export function parseAPIError(error: unknown): APIError {
  if (error instanceof Error) {
    try {
      return JSON.parse(error.message);
    } catch {
      return { message: error.message, status: 500 };
    }
  }
  return { message: 'Unknown error occurred', status: 500 };
}
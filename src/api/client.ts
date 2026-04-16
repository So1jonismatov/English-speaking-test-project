import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const isDev = import.meta.env.DEV;
const baseURL = isDev ? '/api' : API_BASE_URL.replace(/\/+$/, '');

type ApiErrorPayload = {
  message?: string;
  error?: string;
  detail?: string | Array<{ msg?: string }>;
};

const extractDetailMessage = (detail: ApiErrorPayload['detail']): string | undefined => {
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail)) {
    return detail
      .map((entry) => entry?.msg?.trim())
      .find((message): message is string => Boolean(message));
  }

  return undefined;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = 'Something went wrong.',
): string => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  return (
    responseData?.message?.trim() ||
    responseData?.error?.trim() ||
    extractDetailMessage(responseData?.detail) ||
    error.message ||
    fallbackMessage
  );
};

export const isApiUnauthorizedError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

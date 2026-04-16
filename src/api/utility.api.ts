import { apiClient } from './client';
import type { PingResponse } from './api.types';

export const utilityApi = {
  /**
   * Ping the server to check connection
   * GET /ping
   */
  async ping(): Promise<PingResponse> {
    const response = await apiClient.get<PingResponse>('/ping');
    return response.data;
  },
};

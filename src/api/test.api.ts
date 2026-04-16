import { apiClient } from './client';
import type {
  QuestionsResponse,
  TestsResponse,
  TestResponse,
  TestStatusResponse,
  CreateTestResponse,
} from './api.types';

export const testApi = {
  /**
   * Get random questions for test
   * GET /questions
   */
  async getQuestions(): Promise<QuestionsResponse> {
    const response = await apiClient.get<QuestionsResponse>('/questions');
    return response.data;
  },

  /**
   * Get all tests
   * GET /tests
   */
  async getTests(): Promise<TestsResponse> {
    const response = await apiClient.get<TestsResponse>('/tests');
    return response.data;
  },

  /**
   * Get specific test by ID
   * GET /test/{test_id}
   */
  async getTest(testId: string): Promise<TestResponse> {
    const response = await apiClient.get<TestResponse>(`/test/${testId}`);
    return response.data;
  },

  /**
   * Get test status
   * GET /status/{test_id}
   */
  async getStatus(testId: string): Promise<TestStatusResponse> {
    const response = await apiClient.get<TestStatusResponse>(`/status/${testId}`);
    return response.data;
  },

  /**
   * Create/submit test with audio files
   * POST /test (multipart/form-data)
   */
  async createTest(data: FormData): Promise<CreateTestResponse> {
    const response = await apiClient.post<CreateTestResponse>('/test', data);
    return response.data;
  },
};

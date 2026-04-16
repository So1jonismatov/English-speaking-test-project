// API Response Types based on api.json OpenAPI spec

// ============ Auth Types ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  district_id: number;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  token?: string;
}

export interface SignupResponse {
  status: boolean;
  message?: string;
  token?: string;
}

export interface LogoutResponse {
  status: boolean;
  message?: string;
}

export interface UserResponse {
  status: boolean;
  message?: string;
  user?: User;
}

export interface ApiActionResult {
  success: boolean;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  surname?: string;
  phone?: string | null;
  phoneNumber?: string; // Computed field for compatibility
  district_id?: number;
  region?: string; // Computed field for compatibility
  city?: string; // Computed field for compatibility
  role?: string;
  // Add other user fields as needed based on actual backend response
}

// ============ Question Types ============

export interface Question {
  id: number;
  question_text: string;
}

export type UnknownRecord = Record<string, unknown>;

export interface QuestionsResponse {
  status: boolean;
  error?: string;
  topic?: string;
  part1: Question[];
  part2: Question[];
  part3: Question[];
}

// ============ Test Types ============

export interface Test {
  id: string;
  [key: string]: unknown;
}

export interface TestsResponse {
  status: boolean;
  error?: string;
  tests: Test[];
}

export interface TestResponse {
  status: boolean;
  error?: string;
  test: Test;
}

export interface TestStatusResponse {
  status: boolean;
  error?: string;
  test_status: string;
}

export interface CreateTestRequest {
  questions: string; // JSON string
  part: number;
  files: File[];
}

export interface CreateTestResponse {
  status: boolean;
  message?: string;
  error?: string;
  test_id?: string;
  id?: string;
}

// ============ Ping Types ============

export interface PingResponse {
  status: boolean;
  time: string;
}

// ============ Error Types ============

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ============ API Error ============

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// src/mocks/authMock.js
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber: string;
  region: string;
  city: string;
  role: string;
  dateOfBirth?: string;
  district?: string;
}

interface JwtPayload {
  userId: number;
  email: string;
  exp: number;
}

// Mock user database
const users: User[] = [
  {
    id: 1,
    email: 'test@email.com',
    password: 'password123',
    name: 'Test',
    surname: 'User',
    phoneNumber: '+998938510523',
    region: 'Tashkent',
    city: 'Tashkent',
    role: 'user',
  }
];

// Generate JWT token
function generateAuthToken(payload: JwtPayload) {
  // Simple JWT-like token generation (for mock purposes only)
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature'); // In real app, this would be computed
  return `${header}.${body}.${signature}`;
}

export async function login({ email, password }: { email: string; password: string }): Promise<[number, any]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return [401, { message: 'Invalid email or password' }];
  }

  // Create payload for JWT
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
  };

  const authToken = generateAuthToken(payload);
  // Return user data without password
  const userData = { ...user };
  delete (userData as any).password;

  return [200, { authToken, user: userData }];
}

export async function signup(userData: Omit<User, 'id' | 'role'>): Promise<[number, any]> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

  // Check if user already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return [409, { message: 'User with this email already exists' }];
  }

  // Create new user
  const newUser: User = {
    id: users.length + 1, // Simple ID generation
    ...userData,
    role: 'user',
  };

  users.push(newUser);

  // Create payload for JWT
  const payload: JwtPayload = {
    userId: newUser.id,
    email: newUser.email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
  };

  const authToken = generateAuthToken(payload);
  // Return user data without password
  const returnUserData = { ...newUser };
  delete (returnUserData as any).password;

  return [201, { authToken, user: returnUserData }];
}

export async function getUser(token: string): Promise<[number, any]> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

  if (!token) {
    return [401, { message: 'No token provided' }];
  }

  try {
    // Decode the token to get user info
    const decoded: JwtPayload = jwtDecode(token);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return [401, { message: 'Token expired' }];
    }

    // Find user by ID from token
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return [401, { message: 'User not found' }];
    }

    // Return user data without password
    const userData = { ...user };
    delete (userData as any).password;

    return [200, { user: userData }];
  } catch (error) {
    return [401, { message: 'Invalid token' }];
  }
}

// Mock for your grading endpoint (expand as needed for other APIs)
export async function getGrading(userId: number): Promise<[number, any]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (!userId) {
    return [400, { message: 'Invalid user ID' }];
  }
  // Simulated data
  return [200, { score: 7.5, feedback: 'Good pronunciation, but improve fluency.' }];
}

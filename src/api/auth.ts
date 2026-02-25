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

export interface AuthResponse {
  message?: string;
  authToken?: string;
  user?: Omit<User, 'password'>;
}

export interface LoginResponse {
  authToken: string;
  user: Omit<User, 'password'>;
}

export interface SignupResponse {
  authToken: string;
  user: Omit<User, 'password'>;
}

export interface UserResponse {
  user: Omit<User, 'password'>;
}

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

function generateAuthToken(payload: JwtPayload) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');
  return `${header}.${body}.${signature}`;
}

export async function login({ email, password }: { email: string; password: string }): Promise<[number, AuthResponse]> {

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return [401, { message: 'Invalid email or password' }];
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
  };

  const authToken = generateAuthToken(payload);
  const userData: Omit<User, 'password'> = { ...user };
  delete (userData as any).password;

  return [200, { authToken, user: userData }];
}

export async function signup(userData: Omit<User, 'id' | 'role'>): Promise<[number, AuthResponse]> {

  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return [409, { message: 'User with this email already exists' }];
  }

  const newUser: User = {
    id: users.length + 1,
    ...userData,
    role: 'user',
  };

  users.push(newUser);

  const payload: JwtPayload = {
    userId: newUser.id,
    email: newUser.email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
  };

  const authToken = generateAuthToken(payload);
  const returnUserData: Omit<User, 'password'> = { ...newUser };
  delete (returnUserData as any).password;

  return [201, { authToken, user: returnUserData }];
}

export async function getUser(token: string): Promise<[number, AuthResponse]> {

  if (!token) {
    return [401, { message: 'No token provided' }];
  }

  try {
    const decoded: JwtPayload = jwtDecode(token);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return [401, { message: 'Token expired' }];
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return [401, { message: 'User not found' }];
    }

    const userData: Omit<User, 'password'> = { ...user };
    delete (userData as any).password;

    return [200, { user: userData }];
  } catch (_error) {
    return [401, { message: 'Invalid token' }];
  }
}

export async function getGrading(userId: number): Promise<[number, { score: number; feedback: string } | { message: string }]> {
  if (!userId) {
    return [400, { message: 'Invalid user ID' }];
  }
  return [200, { score: 7.5, feedback: 'Good pronunciation, but improve fluency.' }];
}

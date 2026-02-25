// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { login as mockLogin, getUser as mockGetUser, signup as mockSignup } from '@/api/auth'; // Import mocks
import type { AuthResponse } from '@/api/auth';
import React from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  region: string;
  city: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<[boolean, AuthResponse]>;
  signup: (userData: any) => Promise<[boolean, AuthResponse]>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        const [status, response] = await mockGetUser(token);
        if (status === 200 && response.user) {
          setUser(response.user as User);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<[boolean, AuthResponse]> => {
    const [status, response] = await mockLogin({ email, password });
    if (status === 200 && response.authToken && response.user) {
      localStorage.setItem('token', response.authToken);
      setToken(response.authToken);
      setUser(response.user as User);
      return [true, response];
    } else {
      console.error('Login failed:', response.message);
      return [false, response];
    }
  };

  const signup = async (userData: any): Promise<[boolean, AuthResponse]> => {
    const [status, response] = await mockSignup(userData);
    if (status === 201 && response.authToken && response.user) {
      localStorage.setItem('token', response.authToken);
      setToken(response.authToken);
      setUser(response.user as User);
      return [true, response];
    } else {
      console.error('Signup failed:', response.message);
      return [false, response];
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
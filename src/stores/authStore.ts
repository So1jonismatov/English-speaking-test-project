import { create } from 'zustand';
import { login as mockLogin, getUser as mockGetUser, signup as mockSignup } from '@/api/auth';

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

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<[boolean, any]>;
  signup: (userData: any) => Promise<[boolean, any]>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  
  // User profile methods
  updateUserProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: !!localStorage.getItem('token'),
  
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const [status, response] = await mockGetUser(token);
      if (status === 200) {
        set({ user: response.user, token, loading: false, isAuthenticated: true });
      } else {
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false, isAuthenticated: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string): Promise<[boolean, any]> => {
    const [status, response] = await mockLogin({ email, password });
    if (status === 200) {
      localStorage.setItem('token', response.authToken);
      set({ 
        user: response.user, 
        token: response.authToken, 
        isAuthenticated: true 
      });
      return [true, response];
    } else {
      console.error('Login failed:', response.message);
      return [false, response];
    }
  },

  signup: async (userData: any): Promise<[boolean, any]> => {
    const [status, response] = await mockSignup(userData);
    if (status === 201) {
      localStorage.setItem('token', response.authToken);
      set({ 
        user: response.user, 
        token: response.authToken, 
        isAuthenticated: true 
      });
      return [true, response];
    } else {
      console.error('Signup failed:', response.message);
      return [false, response];
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUserProfile: async (updatedData) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null
    }));

    return true;
  }
}));

export default useAuthStore;
import { create } from 'zustand';
import { authApi } from '@/api/auth.api';
import { getApiErrorMessage, isApiUnauthorizedError } from '@/api/client';
import type { ApiActionResult, User } from '@/api/api.types';

const toCompatibleUser = (user: User): User => ({
  ...user,
  name: user.name || user.first_name,
  surname: user.surname || user.last_name,
  phoneNumber: user.phoneNumber || user.phone || '',
});

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Authentication methods
  login: (email: string, password: string) => Promise<ApiActionResult>;
  signup: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    district_id: number;
  }) => Promise<ApiActionResult>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;

  // User profile methods
  updateUserProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  clearAuth: () => {
    set({ user: null, loading: false, isAuthenticated: false });
  },

  initializeAuth: async () => {
    set({ loading: true });

    try {
      const response = await authApi.getUser();

      if (response.status && response.user) {
        set({
          user: toCompatibleUser(response.user),
          loading: false,
          isAuthenticated: true,
        });
      } else {
        set({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      if (!isApiUnauthorizedError(error)) {
        console.error('Auth initialization error:', error);
      }

      set({ user: null, loading: false, isAuthenticated: false });
    }
  },

  login: async (email: string, password: string): Promise<ApiActionResult> => {
    set({ loading: true });

    try {
      const response = await authApi.login({ email, password });

      if (!response.status) {
        set({ loading: false, isAuthenticated: false });
        return {
          success: false,
          message: response.message || 'Invalid email or password.',
        };
      }

      const userResponse = await authApi.getUser();

      if (!userResponse.status || !userResponse.user) {
        set({ user: null, loading: false, isAuthenticated: false });
        return {
          success: false,
          message: userResponse.message || 'Login succeeded, but the user profile could not be loaded.',
        };
      }

      set({
        user: toCompatibleUser(userResponse.user),
        loading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      if (isApiUnauthorizedError(error)) {
        set({ user: null, loading: false, isAuthenticated: false });
      } else {
        set({ loading: false });
      }

      return {
        success: false,
        message: getApiErrorMessage(error, 'Login failed.'),
      };
    }
  },

  signup: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    district_id: number;
  }): Promise<ApiActionResult> => {
    set({ loading: true });

    try {
      const response = await authApi.signup(userData);

      if (!response.status) {
        set({ loading: false, isAuthenticated: false });
        return {
          success: false,
          message: response.message || 'Signup failed.',
        };
      }

      const userResponse = await authApi.getUser();

      if (!userResponse.status || !userResponse.user) {
        set({ user: null, loading: false, isAuthenticated: false });
        return {
          success: false,
          message: userResponse.message || 'Signup succeeded, but the user profile could not be loaded.',
        };
      }

      set({
        user: toCompatibleUser(userResponse.user),
        loading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);

      if (isApiUnauthorizedError(error)) {
        set({ user: null, loading: false, isAuthenticated: false });
      } else {
        set({ loading: false });
      }

      return {
        success: false,
        message: getApiErrorMessage(error, 'Signup failed.'),
      };
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, loading: false, isAuthenticated: false });
    }
  },

  updateUserProfile: async (updatedData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null
    }));

    return true;
  }
}));

export default useAuthStore;

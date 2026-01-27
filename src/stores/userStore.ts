import { create } from 'zustand';

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

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateUserProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  updateUserProfile: async (updatedData) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null
    }));
    
    return true; 
  }
}));

export default useUserStore;
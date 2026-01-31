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
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

export default useUserStore;
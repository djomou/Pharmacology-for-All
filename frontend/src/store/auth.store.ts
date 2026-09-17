import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'patient' | 'medecin' | 'admin' | 'pharmacien';

export interface User {
  id:        number;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      UserRole;
}

interface AuthState {
  user:    User | null;
  token:   string | null;
  isAuth:  boolean;
  setAuth: (user: User, token: string) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      isAuth:  false,
      setAuth: (user, token) => set({ user, token, isAuth: true }),
      logout:  () => set({ user: null, token: null, isAuth: false }),
    }),
    { name: 'medoc-auth' },
  ),
);

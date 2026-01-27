import { createContext, useContext } from 'react';
import User from '../objects/User';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePicUrl: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    isPublic: boolean;
    profilePicUrl: string;
  }>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not provided');
  return ctx;
};

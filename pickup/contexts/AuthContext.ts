import { createContext, useContext, useState, ReactNode } from 'react';
import User from '../objects/User';

type AuthContextType = {
  user: User | null;
  token: string | null;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePicUrl: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not provided');
  return ctx;
};

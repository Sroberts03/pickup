// auth/AuthProvider.tsx
import { ReactNode, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useServer } from '../contexts/ServerContext';
import User from '@/objects/User';

import * as SecureStore from 'expo-secure-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const server = useServer();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsFavoriteSports, setNeedsFavoriteSportsState] = useState(false);

  const updateNeedsFavoriteSports = async (value: boolean) => {
    if (value) {
      await SecureStore.setItemAsync('needsFavoriteSports', 'true');
    } else {
      await SecureStore.deleteItemAsync('needsFavoriteSports');
    }
    setNeedsFavoriteSportsState(value);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to restore token from storage
        const storedToken = await SecureStore.getItemAsync('authToken');
        const storedNeedsFavorites = await SecureStore.getItemAsync('needsFavoriteSports');
        setNeedsFavoriteSportsState(storedNeedsFavorites === 'true');

        if (storedToken) {
          // In a real app, we'd validate the token with the server here.
          // For now, we'll assume if we have a token, we might be logged in, 
          // but since TestServerFacade is memory-only, it won't know this token.
          // Ideally, server.validateToken(storedToken) would return the user.

          // For this memory-mock implementation, we'll just try to get current user 
          // and if that fails, we can't really "restore" the session fully without a backend.
          // However, to satisfy the requirement, we will implement the client-side logic.

          const result = await server.getCurrentUser();
          if (result) {
            setUser(result.user);
            setToken(result.token);
          } else {
            await SecureStore.deleteItemAsync('authToken');
          }
        } else {
          const result = await server.getCurrentUser();
          if (result) {
            setUser(result.user);
            setToken(result.token);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [server]);

  const signup = async (email: string, password: string, firstName: string, lastName: string, profilePicUrl: string) => {
    const result = await server.signup(email, password, firstName, lastName, profilePicUrl);

    await SecureStore.setItemAsync('authToken', result.token);
    setToken(result.token);
    setUser(result.user);
    await updateNeedsFavoriteSports(true);
  };

  const login = async (email: string, password: string) => {
    const result = await server.login(email, password);

    await SecureStore.setItemAsync('authToken', result.token);
    setToken(result.token);
    setUser(result.user);
    await updateNeedsFavoriteSports(false);
  };

  const logout = async () => {
    try {
      await server.logout();
    } catch (e) {
      console.error("Logout failed", e);
    }

    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('needsFavoriteSports');
    setUser(null);
    setToken(null);
    setNeedsFavoriteSportsState(false);
  };

  const updateUser = async (userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    profilePicUrl: string;
  }>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser = await server.updateUser(user.id, userData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, loading, updateUser, needsFavoriteSports, setNeedsFavoriteSports: updateNeedsFavoriteSports }}>
      {children}
    </AuthContext.Provider>
  );
}

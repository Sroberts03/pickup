// auth/AuthProvider.tsx
import { ReactNode, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useServer } from '../contexts/ServerContext';
import User from '@/objects/User';

export function AuthProvider({ children }: { children: ReactNode }) {
  const server = useServer();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await server.getCurrentUser();
        if (result) {
          setUser(result.user);
          setToken(result.token);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [server]);

  const signup = async (email: string, password: string, firstName: string, lastName: string, profilePicUrl: string) => {
    const result = await server.signup(email, password, firstName, lastName, profilePicUrl);

    setToken(result.token);
    setUser(result.user);
  };

  const login = async (email: string, password: string) => {
    const result = await server.login(email, password);

    setToken(result.token);
    setUser(result.user);
  };

  const logout = async () => {
    await server.logout();

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

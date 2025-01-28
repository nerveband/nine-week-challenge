import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { pocketBaseService } from '@/services/PocketBaseService';
import type { BaseAuthStore } from 'pocketbase';

type AuthModel = BaseAuthStore['model'];

interface AuthContextType {
  user: AuthModel;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: unknown; error?: unknown }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; data?: unknown; error?: unknown }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthModel>(pocketBaseService.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    // Subscribe to auth state changes
    const unsubscribe = pocketBaseService.client.authStore.onChange((token, model) => {
      setUser(model);
      setIsLoading(false);
    });

    // Initialize authentication
    const initAuth = async () => {
      try {
        await pocketBaseService.initializeAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Retry authentication after 2 seconds
        retryTimeout = setTimeout(initAuth, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      unsubscribe();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await pocketBaseService.login(email, password);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const userData = await pocketBaseService.register(email, password, password, name);
      await pocketBaseService.login(email, password);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error };
    }
  };

  const logout = () => {
    pocketBaseService.logout();
  };

  const value = {
    user,
    isAuthenticated: pocketBaseService.isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
} 
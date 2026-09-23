import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../../domain/models/auth.model';
import { API_CONFIG } from '../../infrastructure/config/api.config';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: (type: 'admin' | 'policia') => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          deviceId: 'WEB-CLIENT-ECUADOR-APP',
          plataforma: 'WEB',
          modelo: 'Navegador Web / Terminal Táctico',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setToken(data.accessToken);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error de conexión con el servidor');
      setIsLoading(false);
      return false;
    }
  };

  const quickLogin = async (type: 'admin' | 'policia'): Promise<boolean> => {
    if (type === 'admin') {
      return login('alkut202@gmail.com', 'Admin1234!');
    } else {
      return login('policia@alerta.gob.ec', 'Policia1234!');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        quickLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

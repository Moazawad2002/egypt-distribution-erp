import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedBranchId: string | null;
  setSelectedBranchId: (branchId: string | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('erp_token'));
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('erp_token');
      if (storedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          if (userData.role !== 'CEO' && userData.role !== 'ADMIN' && userData.branchId) {
            setSelectedBranchId(userData.branchId);
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error);
          localStorage.removeItem('erp_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const res = await api.login(credentials);
    localStorage.setItem('erp_token', res.token);
    setToken(res.token);
    setUser(res.user);

    if (res.user.role !== 'CEO' && res.user.role !== 'ADMIN' && res.user.branchId) {
      setSelectedBranchId(res.user.branchId);
    } else {
      setSelectedBranchId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    setToken(null);
    setUser(null);
    setSelectedBranchId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedBranchId,
        setSelectedBranchId,
        login,
        logout,
        isLoading
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

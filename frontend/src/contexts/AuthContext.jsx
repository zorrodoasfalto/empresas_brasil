import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (storedToken && userData) {
      const parsedUser = JSON.parse(userData);
      
      setToken(storedToken);
      setUser(parsedUser);
      authService.setAuthToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔍 AuthContext: Iniciando login para:', email);
      const response = await authService.login(email, password);
      console.log('🔍 AuthContext: Login response received', response);
      
      if (!response.token || !response.user) {
        console.error('🔍 AuthContext: Resposta inválida - missing token or user');
        throw new Error('Resposta de login inválida');
      }
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      authService.setAuthToken(response.token);
      
      setToken(response.token);
      setUser(response.user);
      
      console.log('🔍 AuthContext: State updated - token:', !!response.token, 'user:', !!response.user);
      console.log('🔍 AuthContext: isAuthenticated will be:', !!(response.user && response.token));
      
      // Verificar se o trial expirou
      if (response.trialExpired && !response.hasAccess) {
        toast.warning('Seu período de trial de 7 dias expirou. Escolha um plano para continuar!');
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { 
          success: true, 
          trialExpired: true, 
          redirectToSubscription: true 
        };
      }
      
      toast.success('Login realizado com sucesso!');
      
      // Force a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('🔍 AuthContext: Login error', error);
      const message = error.response?.data?.message || error.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await authService.register(email, password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      authService.setAuthToken(response.token);
      
      setToken(response.token);
      setUser(response.user);
      toast.success('Cadastro realizado com sucesso!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer cadastro';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.removeAuthToken();
    setToken(null);
    setUser(null);
    toast.info('Logout realizado com sucesso!');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
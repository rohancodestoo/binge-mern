import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('bingeUser')) || null
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bingeUser', JSON.stringify(data));
    setUser(data);
    setLoading(false);
    return data;
  };

  const register = async (username, email, password) => {
    setLoading(true);
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('bingeUser', JSON.stringify(data));
    setUser(data);
    setLoading(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bingeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

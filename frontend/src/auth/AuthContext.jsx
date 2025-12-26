import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, getUser, setAuth, clearAuth } from './storage.js';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      const t = getToken();
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.get('/auth/me');
        setUser(data.data);
        setLoading(false);
      } catch (e) {
        clearAuth();
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    }
    boot();
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    const tk = data.data.token;
    const u = data.data.user;
    setAuth(tk, u);
    setToken(tk);
    setUser(u);
    // Refresh full profile
    try {
      const me = await client.get('/auth/me');
      setUser(me.data.data);
    } catch {}
    return { token: tk, user: u };
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

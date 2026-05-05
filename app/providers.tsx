'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  usuario: string | null;
  setUsuario: (usuario: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Efeito para carregar usuário na montagem
  useEffect(() => {
    const usuarioStored = localStorage.getItem('nf_current_user');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuarioState(usuarioStored);
    setIsLoading(false);
  }, []);

  // Efeito para proteger rotas privadas
  useEffect(() => {
    if (isLoading) return; // Não redirecionar até que o estado esteja carregado
    
    const rotasPrivadas = ['/lancar', '/relatorio', '/oficinas'];
    
    if (rotasPrivadas.includes(pathname) && !usuario) {
      router.push('/');
    }
  }, [pathname, router, usuario, isLoading]);

  const setUsuario = (novoUsuario: string) => {
    localStorage.setItem('nf_current_user', novoUsuario);
    setUsuarioState(novoUsuario);
  };

  const logout = () => {
    localStorage.removeItem('nf_current_user');
    setUsuarioState(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole, PersonaDemoUser } from '../types';
import { DEMO_PERSONAS, INITIAL_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentPersona: PersonaDemoUser | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  switchPersona: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omg_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    // Default to Super Admin demo persona
    return INITIAL_USERS[0];
  });

  const [currentPersona, setCurrentPersona] = useState<PersonaDemoUser | null>(() => {
    if (!currentUser) return DEMO_PERSONAS[0];
    return DEMO_PERSONAS.find(p => p.role === currentUser.role) || DEMO_PERSONAS[0];
  });

  const switchPersona = (role: UserRole) => {
    const targetPersona = DEMO_PERSONAS.find(p => p.role === role) || DEMO_PERSONAS[0];
    const targetUser = INITIAL_USERS.find(u => u.role === role) || {
      id: `usr-${Date.now()}`,
      name: targetPersona.name,
      email: targetPersona.email,
      role: targetPersona.role,
      department: targetPersona.department,
      status: 'Active' as const,
    };

    setCurrentUser(targetUser);
    setCurrentPersona(targetPersona);
    localStorage.setItem('omg_auth_user', JSON.stringify(targetUser));
  };

  const login = (email: string, role?: UserRole) => {
    const matchedPersona = DEMO_PERSONAS.find(
      p => p.email.toLowerCase() === email.toLowerCase() || p.role === role
    ) || DEMO_PERSONAS[0];

    switchPersona(matchedPersona.role);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPersona(null);
    localStorage.removeItem('omg_auth_user');
  };

  const hasPermission = (path: string): boolean => {
    if (!currentUser || !currentPersona) return false;
    if (currentPersona.role === 'SUPER_ADMIN') return true;
    return currentPersona.allowedNav.includes(path);
  };

  useEffect(() => {
    if (currentUser) {
      const persona = DEMO_PERSONAS.find(p => p.role === currentUser.role);
      if (persona) setCurrentPersona(persona);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPersona,
        isAuthenticated: !!currentUser,
        login,
        switchPersona,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

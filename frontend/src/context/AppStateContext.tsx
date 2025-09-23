import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Role = 'citizen' | 'officer' | 'ambulance';

interface AppState {
  role: Role | null;
  phone: string | null;
  profileComplete: boolean;
}

interface AppStateContextType {
  appState: AppState;
  setRole: (role: Role | null) => void;
  setPhone: (phone: string | null) => void;
  setProfileComplete: (complete: boolean) => void;
  clearState: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
  role: null,
  phone: null,
  profileComplete: false,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useLocalStorage<AppState>('app_state', INITIAL_STATE);

  const setRole = (role: Role | null) => {
    setAppState(prev => ({ ...prev, role }));
  };

  const setPhone = (phone: string | null) => {
    setAppState(prev => ({ ...prev, phone }));
  };

  const setProfileComplete = (complete: boolean) => {
    setAppState(prev => ({ ...prev, profileComplete: complete }));
  };

  const clearState = () => {
    setAppState(INITIAL_STATE);
  };

  return (
    <AppStateContext.Provider value={{ appState, setRole, setPhone, setProfileComplete, clearState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
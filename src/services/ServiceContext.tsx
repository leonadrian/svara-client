import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { IServiceRegistry } from './interfaces';
import { FirestoreUserService } from './firestore/FirestoreUserService';
import { FirestoreScenarioService } from './firestore/FirestoreScenarioService';
import { FirestoreRecordingService } from './firestore/FirestoreRecordingService';

const ServiceContext = createContext<IServiceRegistry | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo<IServiceRegistry>(() => {
    console.info('🔌 [DI Container] Swapping in real-time Firestore database adapters.');
    return {
      userService: new FirestoreUserService(),
      scenarioService: new FirestoreScenarioService(),
      recordingService: new FirestoreRecordingService(),
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): IServiceRegistry {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
export * from './interfaces';

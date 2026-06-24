import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { IServiceRegistry } from './interfaces';
import { UserApiService } from './rest/UserApiService';
import { ScenarioApiService } from './rest/ScenarioApiService';
import { RecordingApiService } from './rest/RecordingApiService';
import { FirebaseStorageAdapter } from './rest/FirebaseStorageAdapter';

const ServiceContext = createContext<IServiceRegistry | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo<IServiceRegistry>(() => {
    console.info('🔌 [DI Container] Swapping in server-side REST API adapters.');
    return {
      userService: new UserApiService(),
      scenarioService: new ScenarioApiService(),
      recordingService: new RecordingApiService(),
      storageService: new FirebaseStorageAdapter(),
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

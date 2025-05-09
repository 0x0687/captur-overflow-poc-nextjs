"use client"
import { CapturModel } from '@/api/models/captur-models';
import { fetchCapturInstance } from '@/api/queries/captur';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface CapturContextValue {
  captur?: CapturModel;
  loading: boolean;
  error?: Error;
}

// Create the context with an initial default value
const CapturContext = createContext<CapturContextValue>({
  captur: undefined,
  loading: true,
  error: undefined,
});

// Provider props interface
interface CapturProviderProps {
  children: ReactNode;
}

// Context Provider component
export const CapturProvider: React.FC<CapturProviderProps> = ({ children }) => {
  const [captur, setCaptur] = useState<CapturModel | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Fetch the Captur instance when the provider mounts
    console.log('Fetching Captur instance...');
    const fetchData = async () => {
      try {
        const data = await fetchCapturInstance();
        console.log(data);
        setCaptur(data);
      } catch (err) {
        console.error('Error fetching Captur instance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CapturContext.Provider value={{ captur, loading, error }}>
      {children}
    </CapturContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCaptur = (): CapturContextValue => {
  const context = useContext(CapturContext);
  if (context === undefined) {
    throw new Error('useCaptur must be used within a CapturProvider');
  }
  return context;
};

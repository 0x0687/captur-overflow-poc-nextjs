"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AgeRange = 'under-18' | '18-25' | '26-40' | '40-plus' | '';
export type Gender = 'male' | 'female' | 'other' | '';

interface LocationTrackerSettingsContextValue {
  ageRange: AgeRange | undefined;
  gender: Gender | undefined;
  setAgeRange: (value: AgeRange) => void;
  setGender: (value: Gender) => void;
}

const LocationTrackerSettingsContext = createContext<LocationTrackerSettingsContextValue>({
  ageRange: undefined,
  gender: undefined,
  setAgeRange: () => {},
  setGender: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export const LocationTrackerSettingsProvider = ({ children }: ProviderProps) => {
  const [ageRange, setAgeRange] = useState<AgeRange | undefined>(undefined);
  const [gender, setGender] = useState<Gender | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAge = window.localStorage.getItem('locationTracker.ageRange') as AgeRange | null;
    const storedGender = window.localStorage.getItem('locationTracker.gender') as Gender | null;

    if (storedAge) {
      setAgeRange(storedAge);
    }
    if (storedGender) {
      setGender(storedGender);
    }
  }, []);

  // Persist ageRange
  useEffect(() => {
    if (ageRange !== undefined) {
      window.localStorage.setItem('locationTracker.ageRange', ageRange);
    } else {
      window.localStorage.removeItem('locationTracker.ageRange');
    }
  }, [ageRange]);

  // Persist gender
  useEffect(() => {
    if (gender !== undefined) {
      window.localStorage.setItem('locationTracker.gender', gender);
    } else {
      window.localStorage.removeItem('locationTracker.gender');
    }
  }, [gender]);

  return (
    <LocationTrackerSettingsContext.Provider value={{ ageRange, gender, setAgeRange, setGender }}>
      {children}
    </LocationTrackerSettingsContext.Provider>
  );
};

export const useLocationTrackerSettings = (): LocationTrackerSettingsContextValue => {
  return useContext(LocationTrackerSettingsContext);
};

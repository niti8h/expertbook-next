"use client";

import { createContext, useContext, ReactNode } from "react";

type SettingsType = {
  site_name?: string;
  site_logo?: string;
  site_favicon?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  [key: string]: any;
};

const SettingsContext = createContext<SettingsType>({});

export const SettingsProvider = ({ 
  settings, 
  children 
}: { 
  settings: SettingsType; 
  children: ReactNode 
}) => {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingsContext);
};

"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface DashboardLayoutContextValue {
  utilityOpen: boolean;
  setUtilityOpen: (open: boolean) => void;
  toggleUtility: () => void;
}

const DashboardLayoutContext =
  createContext<DashboardLayoutContextValue | undefined>(undefined);

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  const [utilityOpen, setUtilityOpen] = useState(true);

  const toggleUtility = () => setUtilityOpen((prev) => !prev);

  return (
    <DashboardLayoutContext.Provider
      value={{ utilityOpen, setUtilityOpen, toggleUtility }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error(
      "useDashboardLayout must be used within DashboardLayoutProvider",
    );
  }
  return context;
}

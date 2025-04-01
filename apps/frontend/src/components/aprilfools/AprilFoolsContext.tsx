import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const AprilFoolsContext = createContext({
  enabled: true,
  setEnabled: (value: boolean) => {},
});

export const AprilFoolsProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(true);

  return (
    <AprilFoolsContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </AprilFoolsContext.Provider>
  );
};

export const useAprilFools = () => useContext(AprilFoolsContext);
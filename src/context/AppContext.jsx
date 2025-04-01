import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  return (
    <AppContext.Provider value={{ isAppLoading, setIsAppLoading }}>
      {children}
    </AppContext.Provider>
  );
};

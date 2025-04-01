import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <UserContext.Provider
      value={{ isUserAuthenticated, setIsUserAuthenticated, loading, setLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};

import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        // Verify token is not expired by checking its payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          return JSON.parse(storedUser);
        } else {
          // Token expired, clear storage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          return null;
        }
      }
    } catch (e) {
      // Invalid stored data, clear it
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    return null;
  });

  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
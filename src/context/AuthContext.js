import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const checkAuthStatus = async () => {
    try {
      const statusResponse = await fetch("http://localhost:3000/auth/status", {
        credentials: "include",
      });

      const statusData = await statusResponse.json();
      console.log("Auth status response:", statusData);

      if (statusData.isAuthenticated && statusData.user) {
        setIsAuthenticated(true);
        setUser({
          displayName: statusData.user.displayName,
          id: statusData.user.id,
          email: statusData.user.email,
          profilePicture: statusData.user.profilePicture
        });
        console.log("Set user state:", statusData.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async () => {
    try {
      window.location.href = 'http://localhost:3000/auth/spotify';
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
    }
  };
  
  const handleCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
      try {
        const userData = JSON.parse(decodeURIComponent(encodedData));
        setUser({
          displayName: userData.displayName || userData._json?.display_name,  // Try both locations
          id: userData.id,
          email: userData.email
        });
        setIsAuthenticated(true);
        window.location.href = '/';
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      const data = await response.json();
      console.log(data.message);

      // Clear user data and redirect to localhost:3000/
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = 'http://localhost:3001/';
      
    } catch (err) {
      console.error("Error logging out:", err);
      // Still clear user data and redirect even if there's an error
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = 'http://localhost:3001/';
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        checkAuthStatus, 
        handleCallback 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

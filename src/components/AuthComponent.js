import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AuthComponent.css";

const AuthComponent = () => {
  const { isAuthenticated, login, logout, checkAuthStatus } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    checkAuthStatus().finally(() => setLoading(false));
  }, []);
  
  return (
    <div className="auth-container">
      <h2>Spotify Authentication</h2>
      {isAuthenticated ? (
        <div className="auth-status">
          <p>🎵 You are already logged in!</p>
          <button onClick={logout} className="auth-btn logout-btn">Log out</button>
        </div>
      ) : (
        <div className="auth-actions">
          <button onClick={login} className="auth-btn login-btn">Log in with Spotify</button>
        </div>
      )}
    </div>
  );
};

export default AuthComponent;

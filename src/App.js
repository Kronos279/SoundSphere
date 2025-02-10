import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext"; // Import AuthContext
import AuthComponent from "./components/AuthComponent";
import Home from "./components/Home";
import Login from "./components/login";
import { PlayerProvider } from "./context/PlayerContext";

function App() {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status
  
  console.log("Auth state in App:", { isAuthenticated }); // Debug log

  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/*" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;

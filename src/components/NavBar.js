import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  
  console.log("User data in NavBar:", user); // Added log

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>SoundSphere</h1>
      </div>
      <div className="user-profile">
        <span className="welcome-text">
          Welcome, {user?.displayName || user?.display_name || 'User'}
        </span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
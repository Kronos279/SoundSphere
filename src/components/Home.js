import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PlaylistPage from "../pages/playlistPage";
import TracksPage from "../pages/TracksPage";
import MusicPlayer from "./MusicPlayer";
import NavBar from "./NavBar";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <NavBar />
      <div className="main-content">
        <MusicPlayer />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Navigate to="/playlists" replace />} />
            <Route path="/playlists" element={<PlaylistPage />} />
            <Route path="/tracks/:playlistId" element={<TracksPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
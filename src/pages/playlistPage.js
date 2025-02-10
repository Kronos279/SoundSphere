import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';  // Updated import path
import "./playlistPage.css"; // Add CSS for styling

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/playlists', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch playlists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="playlist-container">
      <h2 className="playlist-title">Your Playlists</h2>
      <div className="playlists-grid">
        {playlists.length === 0 ? (
          <div className="no-playlists">
            <p>No playlists found.</p>
            <p>Create some playlists on Spotify to see them here!</p>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="playlist-card"
              onClick={() => navigate(`/tracks/${playlist.id}`)}
            >
              <div className="playlist-image-container">
                <img 
                  src={playlist.images?.[0]?.url || '/default-playlist.png'} 
                  alt={playlist.name}
                  className="playlist-image"
                  onError={(e) => {
                    e.target.src = "/default-playlist.png";
                  }}
                />
                <div className="playlist-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="playlist-info">
                <h3 className="playlist-name">{playlist.name}</h3>
                <p className="playlist-tracks">{playlist.tracks?.total || 0} tracks</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;

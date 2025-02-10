import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import { FaDownload, FaSpinner, FaPlay, FaArrowLeft } from 'react-icons/fa'; // Add this import
import { BsFillPlayFill as PlayIcon } from 'react-icons/bs';
import { usePlayer } from '../context/PlayerContext';
import Spinner from '../components/Spinner';  // Updated import path
import "./TracksPage.css";

const DEFAULT_COVER = "/default.jpg";

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TracksPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate(); // Add this hook
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingTracks, setDownloadingTracks] = useState(new Set());
  const [existingTracks, setExistingTracks] = useState(new Set());
  const [playlistDetails, setPlaylistDetails] = useState(null);  // Added state

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        setLoading(true);
        // Fetch playlist details including tracks
        const response = await fetch(`http://localhost:3000/api/playlists/${playlistId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.status}`);
        }

        const data = await response.json();
        setPlaylistDetails(data);
        setTracks(data.tracks.items || []);

        // Check for existing tracks
        const trackIds = data.tracks.items
          .filter(track => track.track)
          .map(track => track.track.id);

        const checkResponse = await fetch('http://localhost:3000/api/tracks/check-tracks', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spotifyIds: trackIds })
        });

        if (checkResponse.ok) {
          const { existingIds } = await checkResponse.json();
          setExistingTracks(new Set(existingIds || []));
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [playlistId]);

  const handleDownload = async (trackId, trackName) => {
    try {
      setDownloadingTracks(prev => new Set([...prev, trackId]));
      
      const track = tracks.find(t => t.track.id === trackId);
      const artistNames = track.track.artists.map(artist => artist.name).join(", ");
      const fullTrackName = `${trackName} - ${artistNames}`;
      
      const response = await fetch('http://localhost:3000/api/tracks/test-download', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotifyId: trackId,
          trackName: fullTrackName
        })
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      setExistingTracks(prev => new Set([...prev, trackId]));
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloadingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });
    }
  };

  const handlePlay = (trackId) => {
    const track = tracks.find(t => t.track.id === trackId);
    if (track) {
      playTrack(track.track);
    }
  };

  const handlePlayClick = (track) => {
    if (track && track.track) {
      playTrack(track.track);
    }
  };

  const handleTrackAction = (track, e) => {
    e.stopPropagation();
    if (existingTracks.has(track.track.id)) {
      playTrack(track.track);
    } else {
      handleDownload(track.track.id, track.track.name);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tracks-container">
      <div className="playlist-header">
        <img 
          src={playlistDetails?.images?.[0]?.url || DEFAULT_COVER} 
          alt={playlistDetails?.name || 'Playlist Cover'}
          className="playlist-cover"
          onError={(e) => {
            e.target.src = DEFAULT_COVER;
          }}
        />
        <div className="playlist-info">
          <h1>{playlistDetails?.name}</h1>
          <p>{playlistDetails?.tracks?.total || 0} tracks</p>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate('/playlists')}
        >
          <FaArrowLeft />
        </button>
      </div>
      <div className="tracks-list">
        {tracks.length === 0 ? (
          <div className="no-tracks">
            <p>No tracks in this playlist.</p>
          </div>
        ) : (
          tracks.map((track, index) => (
            <div 
              key={track.track.id} 
              className="track-item"
              onClick={() => handlePlayClick(track)}
            >
              <span className="track-number">{index + 1}</span>
              <img 
                src={track.track.album?.images?.[0]?.url || DEFAULT_COVER} 
                alt={track.track.name}
                className="track-image"
                onError={(e) => {
                  e.target.src = DEFAULT_COVER;
                }}
              />
              <div className="track-info">
                <h3 className="track-name">{track.track.name}</h3>
                <p className="track-artist">
                  {track.track.artists?.map(artist => artist.name).join(', ')}
                </p>
              </div>
              <span className="track-duration">
                {formatDuration(track.track.duration_ms)}
              </span>
              <button
                className={`action-button ${downloadingTracks.has(track.track.id) ? 'loading' : ''}`}
                onClick={(e) => handleTrackAction(track, e)}
                disabled={downloadingTracks.has(track.track.id)}
              >
                {downloadingTracks.has(track.track.id) ? (
                  <FaSpinner className="spin" />
                ) : existingTracks.has(track.track.id) ? (
                  <PlayIcon className="play-icon" />
                ) : (
                  <FaDownload />
                )}
              </button>
            </div>
          ))
        )}
      </div>
      <div className="tracks-footer">
        Add songs to your playlist in Spotify to listen for free 🙂
      </div>
    </div>
  );
};

export default TracksPage;

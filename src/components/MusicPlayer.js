import React from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import './MusicPlayer.css';

const DEFAULT_COVER = "https://dacmc6y948s7i.cloudfront.net/assets/default-track-f175c127406c742d1b9d4fbbebb1e24a6ca686447df409049f9601234f422f32.png";

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MusicPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, playTrack, seekTo } = usePlayer();

  const handleProgressClick = (e) => {
    if (!duration) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercentage = clickPosition / rect.width;
    const newTime = clickPercentage * duration;
    e.preventDefault();
    e.stopPropagation();
    seekTo(newTime);
  };

  return (
    <div className="music-player">
      <div className="cover-art">
        <img 
          src={currentTrack?.album?.images?.[0]?.url || DEFAULT_COVER}
          alt={currentTrack?.name || "No track playing"}
        />
      </div>
      
      {/* New container for right-side elements */}
      <div className="player-right">
        <div className="progress-container" onClick={handleProgressClick} role="progressbar" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={progress}>
          <span className="time">{formatTime(progress)}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
        
        <div className="controls">
          <button className="control-btn">
            <FaStepBackward />
          </button>
          <button className="control-btn play-btn" onClick={() => currentTrack && playTrack(currentTrack)}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-btn">
            <FaStepForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
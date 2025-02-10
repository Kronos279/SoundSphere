import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  // Replace state for isSeeking with a ref
  const isSeekingRef = useRef(false);

  const audioRef = useRef(new Audio());

  // Setup audio event listeners once
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      console.log('Loaded metadata:', audio.duration);
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      // Only update progress if we're not actively seeking.
      if (!isSeekingRef.current) {
        setProgress(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  const seekTo = (time) => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      isSeekingRef.current = true;
      const newTime = Math.min(Math.max(0, time), duration);
      console.log('Seeking to:', newTime);
      
      // Create a promise to handle the seeking operation
      const seekPromise = new Promise((resolve) => {
        const handleSeeked = () => {
          audio.removeEventListener('seeked', handleSeeked);
          resolve();
        };
        audio.addEventListener('seeked', handleSeeked);
        audio.currentTime = newTime;
      });

      // Wait for seek to complete before resuming playback
      seekPromise.then(() => {
        setProgress(newTime);
        if (isPlaying) {
          audio.play().catch(error => {
            console.error('Error resuming after seek:', error);
          });
        }
        isSeekingRef.current = false;
      });

    } catch (error) {
      console.error('Error seeking:', error);
      isSeekingRef.current = false;
    }
  };

  const playTrack = (track) => {
    const audio = audioRef.current;
    
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        console.log('Pausing track:', track.id);
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('Resuming track:', track.id);
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    // Load new track
    console.log('Loading new track:', track.id);
    audio.src = `http://localhost:3000/api/tracks/stream/${track.id}`;
    setCurrentTrack(track);
    setProgress(0);

    // Play new track
    audio.play()
      .then(() => {
        console.log('Playing new track:', track.id);
        setIsPlaying(true);
      })
      .catch(error => {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      });
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      playTrack,
      seekTo
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
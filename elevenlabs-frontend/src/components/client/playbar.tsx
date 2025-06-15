"use client";

import { useAudioStore } from "@/stores/audio-store";
import { IoPlay, IoPause, IoStop, IoVolumeHigh, IoVolumeLow, IoVolumeOff } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";

export default function Playbar() {
  const {
    currentAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setCurrentTime,
    setVolume,
  } = useAudioStore();

  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // useEffect must come before early returns
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current || !duration) return;
      
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
      setCurrentTime(newTime);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, duration, setCurrentTime]);

  // Don't render if no audio
  if (!currentAudio) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));
    setCurrentTime(newTime);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <IoVolumeOff className="h-4 w-4" />;
    if (volume < 0.5) return <IoVolumeLow className="h-4 w-4" />;
    return <IoVolumeHigh className="h-4 w-4" />;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-center space-x-4">
        {/* Track Info */}
        <div className="flex min-w-0 flex-1 items-center space-x-3">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-full"
            style={{ background: "linear-gradient(45deg, #8b5cf6, #ec4899)" }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {currentAudio.title}
            </p>
            <p className="truncate text-xs text-gray-500">
              {currentAudio.voice} • {currentAudio.service}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
            ) : isPlaying ? (
              <IoPause className="h-4 w-4" />
            ) : (
              <IoPlay className="h-4 w-4 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={stopAudio}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          >
            <IoStop className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex min-w-0 flex-1 items-center space-x-2">
          <span className="text-xs text-gray-500 tabular-nums">
            {formatTime(currentTime)}
          </span>
          
          <div
            ref={progressBarRef}
            className="relative flex-1 cursor-pointer"
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressMouseMove}
            onMouseUp={handleProgressMouseUp}
            onClick={!isDragging ? handleProgressClick : undefined}
          >
            <div className="h-1 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-black transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Progress handle */}
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-black opacity-0 transition-opacity hover:opacity-100"
              style={{ left: `${progressPercentage}%`, transform: "translateX(-50%) translateY(-50%)" }}
            />
          </div>
          
          <span className="text-xs text-gray-500 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          >
            {getVolumeIcon()}
          </button>
          
          {showVolumeSlider && (
            <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-white p-2 shadow-lg border">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="h-20 w-1 cursor-pointer appearance-none bg-gray-200 [writing-mode:vertical-lr] [direction:rtl]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
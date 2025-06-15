import { create } from "zustand";
import type { ServiceType } from "@/types/services";

export interface AudioItem {
  id: string;
  url: string;
  title: string;
  service: ServiceType;
  voice: string;
  duration?: number;
}

interface AudioState {
  // Current audio state
  currentAudio: AudioItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Audio element reference
  audioElement: HTMLAudioElement | null;
  
  // Actions
  playAudio: (audio: AudioItem) => void;
  stopAudio: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  clearAudio: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  currentAudio: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  audioElement: null,

  // Actions
  playAudio: (audio: AudioItem) => {
    const { audioElement, currentAudio, isPlaying } = get();
    
    // If same audio is playing, just toggle pause/play
    if (currentAudio?.id === audio.id && audioElement) {
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        void audioElement.play();
        set({ isPlaying: true });
      }
      return;
    }
    
    // Stop current audio if different
    if (audioElement && currentAudio?.id !== audio.id) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // Set new audio
    set({ 
      currentAudio: audio, 
      isLoading: true,
      currentTime: 0,
      duration: 0 
    });
    
    // Create new audio element if needed
    if (!audioElement || currentAudio?.id !== audio.id) {
      const newAudioElement = new Audio(audio.url);
      
      // Set up event listeners
      newAudioElement.addEventListener('loadedmetadata', () => {
        set({ 
          duration: newAudioElement.duration,
          isLoading: false 
        });
      });
      
      newAudioElement.addEventListener('timeupdate', () => {
        set({ currentTime: newAudioElement.currentTime });
      });
      
      newAudioElement.addEventListener('ended', () => {
        set({ 
          isPlaying: false,
          currentTime: 0 
        });
        newAudioElement.currentTime = 0;
      });
      
      newAudioElement.addEventListener('error', () => {
        set({ 
          isLoading: false,
          isPlaying: false 
        });
        console.error('Audio playback error');
      });
      
      newAudioElement.addEventListener('canplay', () => {
        set({ isLoading: false });
      });
      
      // Set volume
      newAudioElement.volume = get().volume;
      
      set({ audioElement: newAudioElement });
      
      // Start playing
      void newAudioElement.play().then(() => {
        set({ isPlaying: true });
      }).catch((error) => {
        console.error('Audio play error:', error);
        set({ isLoading: false, isPlaying: false });
      });
    }
  },

  stopAudio: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    set({ 
      isPlaying: false, 
      currentTime: 0 
    });
  },

  pauseAudio: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },

  resumeAudio: () => {
    const { audioElement } = get();
    if (audioElement) {
      void audioElement.play();
      set({ isPlaying: true });
    }
  },

  setCurrentTime: (time: number) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
    }
    set({ currentTime: time });
  },

  setVolume: (volume: number) => {
    const { audioElement } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioElement) {
      audioElement.volume = clampedVolume;
    }
    set({ volume: clampedVolume });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setAudioElement: (element: HTMLAudioElement | null) => {
    set({ audioElement: element });
  },

  clearAudio: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    set({
      currentAudio: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      audioElement: null,
    });
  },
})); 
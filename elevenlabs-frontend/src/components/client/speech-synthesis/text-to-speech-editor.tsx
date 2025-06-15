"use client";

import { useState } from "react";
import { useVoiceStore } from "@/stores/voice-store";
import type { ServiceType } from "@/types/services";
import { IoPlay, IoStop } from "react-icons/io5";
import { generateSpeech } from "@/actions/tts";
import { useAudioStore, type AudioItem } from "@/stores/audio-store";

interface TextToSpeechEditorProps {
  service: ServiceType;
  credits: number;
}

export function TextToSpeechEditor({ service, credits }: TextToSpeechEditorProps) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getSelectedVoice = useVoiceStore((state) => state.getSelectedVoice);
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const audioStore = useAudioStore();
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const currentAudio = audioStore.currentAudio;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const isPlaying = audioStore.isPlaying;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const playAudio = audioStore.playAudio;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const stopAudio = audioStore.stopAudio;
  
  const selectedVoice = getSelectedVoice(service);
  const characterCount = text.length;
  const maxCharacters = 5000;
  const isTextValid = text.trim().length > 0 && characterCount <= maxCharacters;
  const hasCredits = credits > 0;

  const handleGenerate = async (): Promise<void> => {
    if (!isTextValid || !selectedVoice || !hasCredits) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result = await generateSpeech({
        text: text.trim(),
        voice: selectedVoice.id,
        service,
      });
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.success && result.data) {
        const audioItem: AudioItem = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          id: result.data.id ?? Date.now().toString(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          url: result.data.audioUrl,
          title: text.length > 50 ? `${text.substring(0, 50)}...` : text,
          service,
          voice: selectedVoice.name,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        playAudio(audioItem);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setError(result.error ?? "Failed to generate speech");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("TTS Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = (): void => {
    if (currentAudio && isPlaying) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      stopAudio();
    } else if (currentAudio) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      playAudio(currentAudio);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Text to Speech</h1>
        <p className="mt-1 text-sm text-gray-600">
          Convert your text into natural-sounding speech using AI voices
        </p>
      </div>

      {/* Credits Display */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Available Credits</span>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
            {credits.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Text Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="text-input" className="text-sm font-medium text-gray-700">
              Text to convert
            </label>
            <span className={`text-xs ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()}
            </span>
          </div>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you'd like to convert to speech..."
            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors ${
              characterCount > maxCharacters 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            rows={8}
            maxLength={maxCharacters}
          />
          {characterCount > maxCharacters && (
            <p className="mt-1 text-xs text-red-500">
              Text exceeds maximum length of {maxCharacters.toLocaleString()} characters
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Generate Button */}
            <button
              onClick={() => void handleGenerate()}
              disabled={!isTextValid || !selectedVoice || !hasCredits || isGenerating}
              className="flex items-center space-x-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <IoPlay className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </button>

            {/* Play/Pause Current Audio */}
            {currentAudio && (
              <button
                onClick={handlePlayPause}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {isPlaying ? (
                  <>
                    <IoStop className="h-4 w-4" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <IoPlay className="h-4 w-4" />
                    <span>Play</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Voice Info */}
          {selectedVoice && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: selectedVoice.gradientColors }}
              />
              <span>Voice: {selectedVoice.name}</span>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Tips for better results:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use punctuation to control pacing and pauses</li>
            <li>• Spell out abbreviations and numbers for clarity</li>
            <li>• Keep sentences reasonably short for natural flow</li>
            <li>• Each generation costs 1 credit</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
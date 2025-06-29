"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { formatDuration } from "@/lib/utils";
import {
  Mic,
  Square,
  Play,
  Pause,
  Settings,
  Activity,
  Volume2,
} from "lucide-react";

interface RecordingInterfaceProps {
  onRecordingComplete?: (recordingId: string) => void;
}

export function RecordingInterface({
  onRecordingComplete,
}: RecordingInterfaceProps) {
  const [recordingName, setRecordingName] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const {
    isRecording,
    isPaused,
    duration,
    recordingId,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    try {
      const name =
        recordingName.trim() || `Recording ${new Date().toLocaleString()}`;
      await startRecording(name);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  };

  const handleStopRecording = async () => {
    await stopRecording();
    if (recordingId && onRecordingComplete) {
      onRecordingComplete(recordingId);
    }
    setRecordingName("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Voice Recorder
        </h2>
        <p className="text-gray-600">
          {isRecording
            ? isPaused
              ? "Recording paused"
              : "Recording in progress..."
            : "Ready to record your voice"}
        </p>
      </div>

      {/* Recording Name Input */}
      {!isRecording && (
        <div className="mb-6">
          <Input
            label="Recording Name (Optional)"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            placeholder="My awesome recording"
          />
        </div>
      )}

      {/* Recording Visualizer */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Main Recording Button */}
          <div
            className={`
            w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
            ${
              isRecording
                ? isPaused
                  ? "bg-yellow-100 border-4 border-yellow-400 shadow-lg"
                  : "bg-red-100 border-4 border-red-500 shadow-xl animate-pulse"
                : "bg-blue-100 border-4 border-blue-500 hover:bg-blue-200 hover:border-blue-600 shadow-lg hover:shadow-xl"
            }
          `}
          >
            {!isRecording ? (
              <Mic
                className="w-12 h-12 text-blue-600"
                onClick={handleStartRecording}
              />
            ) : isPaused ? (
              <Play
                className="w-12 h-12 text-yellow-600"
                onClick={resumeRecording}
              />
            ) : (
              <Activity className="w-12 h-12 text-red-600 animate-pulse" />
            )}
          </div>

          {/* Recording Indicator Rings */}
          {isRecording && !isPaused && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping animation-delay-75"></div>
            </>
          )}
        </div>
      </div>

      {/* Duration Display */}
      <div className="text-center mb-6">
        <div
          className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          ${
            isRecording
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }
        `}
        >
          <div
            className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}
          ></div>
          <span className="font-mono text-lg font-semibold">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {!isRecording ? (
          <Button onClick={handleStartRecording} size="lg" className="px-8">
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={isPaused ? resumeRecording : pauseRecording}
              variant="secondary"
              size="lg"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              )}
            </Button>

            <Button onClick={handleStopRecording} variant="danger" size="lg">
              <Square className="w-5 h-5 mr-2" />
              Stop & Save
            </Button>
          </>
        )}
      </div>

      {/* Settings Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="ghost"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Audio Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
          <h3 className="font-semibold text-gray-900 mb-4">
            Recording Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality</span>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>High (44.1kHz)</option>
                <option>Medium (22kHz)</option>
                <option>Low (16kHz)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Format</span>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>WebM</option>
                <option>WAV</option>
                <option>MP3</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Noise Reduction</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

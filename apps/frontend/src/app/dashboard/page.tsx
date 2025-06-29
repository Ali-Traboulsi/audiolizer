"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api";
import { Recording } from "@/types";
import { Button } from "@/components/ui/button";
import { RecordingInterface } from "@/components/RecordingInterface";
import { AudioPlayer } from "@/components/AudioPlayer";
import { formatDate, formatDuration, formatFileSize } from "@/lib/utils";
import {
  Mic,
  LogOut,
  Trash2,
  Download,
  Play,
  User,
  Calendar,
  Clock,
  HardDrive,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [showRecorder, setShowRecorder] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Load recordings
  const loadRecordings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRecordings();
      setRecordings(data);
    } catch (error) {
      console.error("Failed to load recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRecordings();
    }
  }, [isAuthenticated]);

  const handleRecordingComplete = () => {
    setShowRecorder(false);
    loadRecordings(); // Refresh the list
  };

  const handleDeleteRecording = async (recordingId: string) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    try {
      await apiClient.deleteRecording(recordingId);
      setRecordings(recordings.filter((r) => r.id !== recordingId));

      // Clean up audio URL
      if (audioUrls[recordingId]) {
        URL.revokeObjectURL(audioUrls[recordingId]);
        setAudioUrls((prev) => {
          const next = { ...prev };
          delete next[recordingId];
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to delete recording:", error);
      alert("Failed to delete recording");
    }
  };

  const handlePlayRecording = async (recordingId: string) => {
    if (audioUrls[recordingId]) return; // Already loaded

    try {
      const audioUrl = await apiClient.getRecordingStream(recordingId);
      setAudioUrls((prev) => ({ ...prev, [recordingId]: audioUrl }));
    } catch (error) {
      console.error("Failed to load audio:", error);
      alert("Failed to load audio");
    }
  };

  const handleDownloadRecording = async (
    recordingId: string,
    recordingName?: string,
  ) => {
    try {
      const audioUrl = await apiClient.getRecordingStream(recordingId);
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${recordingName || "recording"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error("Failed to download recording:", error);
      alert("Failed to download recording");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Voice Recorder
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <Button onClick={logout} variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setShowRecorder(!showRecorder)}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <Mic className="w-5 h-5 mr-2" />
            {showRecorder ? "Hide Recorder" : "New Recording"}
          </Button>

          <Button
            onClick={loadRecordings}
            variant="secondary"
            size="lg"
            loading={loading}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Recording Interface */}
        {showRecorder && (
          <div className="mb-8">
            <RecordingInterface onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recordings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recordings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(
                    recordings.reduce((acc, r) => acc + (r.duration || 0), 0),
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(
                    recordings.reduce((acc, r) => acc + (r.totalSize || 0), 0),
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recordings List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Recordings
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading recordings...</p>
            </div>
          ) : recordings.length === 0 ? (
            <div className="p-8 text-center">
              <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recordings yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start recording to see your audio files here
              </p>
              <Button onClick={() => setShowRecorder(true)}>
                <Mic className="w-4 h-4 mr-2" />
                Create First Recording
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {recording.name ||
                          `Recording ${recording.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(recording.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(recording.duration || 0)}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            recording.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {recording.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePlayRecording(recording.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownloadRecording(recording.id, recording.name)
                        }
                        variant="ghost"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRecording(recording.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Audio Player */}
                  {audioUrls[recording.id] && (
                    <AudioPlayer
                      recordingId={recording.id}
                      audioUrl={audioUrls[recording.id]}
                      recordingName={recording.name}
                      duration={recording.duration}
                      onDownload={() =>
                        handleDownloadRecording(recording.id, recording.name)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

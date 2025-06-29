"use client";

import { useState, useRef, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { RecordingState, Recording } from "@/types";

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    chunks: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunkIndexRef = useRef(0);

  const startRecording = useCallback(async (recordingName?: string) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Create recording session
      const recording: Recording = await apiClient.createRecording({
        name: recordingName || `Recording ${new Date().toLocaleString()}`,
        format: "webm",
      });

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunkIndexRef.current = 0;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          // Don't upload individual chunks for WebM - collect them all first
        }
      };

      mediaRecorder.onstop = async () => {
        // Combine all chunks into a single blob
        if (chunks.length > 0) {
          try {
            const completeBlob = new Blob(chunks, {
              type: "audio/webm;codecs=opus",
            });

            // Upload the complete recording as a single chunk
            await apiClient.uploadChunk(
              recording.id,
              completeBlob,
              0, // Single chunk index
              true // This is the final and only chunk
            );
          } catch (error) {
            console.error("Failed to upload recording:", error);
          }
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording - collect all data in one chunk at the end
      mediaRecorder.start();

      // Update state
      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingId: recording.id,
        chunks,
      }));

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Reset state
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        chunks: [],
        recordingId: undefined,
      });
    }
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}

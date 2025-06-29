// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// Recording Types
export interface Recording {
  id: string;
  userId: string;
  name?: string;
  duration?: number;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "DELETED";
  format: string;
  totalSize?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  _count?: {
    chunks: number;
  };
}

export interface AudioChunk {
  id: string;
  chunkIndex: number;
  size: number;
  duration?: number;
  mimeType: string;
  createdAt: string;
}

export interface RecordingWithChunks extends Recording {
  chunks: AudioChunk[];
}

export interface CreateRecordingDto {
  name?: string;
  format?: string;
}

// Audio Recording States
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordingId?: string;
  chunks: Blob[];
}

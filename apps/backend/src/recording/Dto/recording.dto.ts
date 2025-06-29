import { RecordingStatus } from '../../../../../packages/database/generated/prisma';

export class CreateRecordingDto {
  name?: string;
  format?: string; // webm, wav, mp3
}

export class UploadChunkDto {
  recordingId: string;
  chunkIndex: number;
  isLastChunk: boolean;
}

export interface RecordingResponse {
  id: string;
  name?: string;
  duration?: number;
  status: RecordingStatus;
  format: string;
  totalSize?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ChunkResponse {
  id: string;
  recordingId: string;
  chunkIndex: number;
  size: number;
  duration?: number;
  createdAt: Date;
}

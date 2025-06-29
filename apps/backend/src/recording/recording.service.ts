import { RecordingStatus } from '../../../../packages/database/generated/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecordingDto, UploadChunkDto } from './Dto/recording.dto';

@Injectable()
export class RecordingService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecording({
    userId,
    createRecordingDto: dto,
  }: {
    userId: string;
    createRecordingDto: CreateRecordingDto;
  }) {
    const recording = await this.prisma.recording.create({
      data: {
        userId,
        name: dto.name,
        format: dto.format || 'webm',
        status: RecordingStatus.ACTIVE,
      },
    });

    return recording;
  }

  async uploadChunk(
    userId: string,
    dto: UploadChunkDto,
    audioBuffer: Buffer,
    mimeType?: string,
  ) {
    // Verify recording belongs to user
    const recording = await this.prisma.recording.findFirst({
      where: {
        id: dto.recordingId,
        userId,
      },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    if (recording.status !== RecordingStatus.ACTIVE) {
      throw new BadRequestException('Recording is not active');
    }

    // Check if chunk already exists
    const existingChunk = await this.prisma.audioChunk.findUnique({
      where: {
        recordingId_chunkIndex: {
          recordingId: dto.recordingId,
          chunkIndex: dto.chunkIndex,
        },
      },
    });

    let chunk;
    if (existingChunk) {
      // Update existing chunk
      chunk = await this.prisma.audioChunk.update({
        where: {
          id: existingChunk.id,
        },
        data: {
          audioData: audioBuffer,
          size: audioBuffer.length,
          mimeType: mimeType || 'audio/webm',
        },
      });
    } else {
      // Create new chunk
      chunk = await this.prisma.audioChunk.create({
        data: {
          recordingId: dto.recordingId,
          chunkIndex: dto.chunkIndex,
          audioData: audioBuffer,
          size: audioBuffer.length,
          mimeType: mimeType || 'audio/webm',
        },
      });
    }

    // If this is the last chunk, mark recording as completed
    if (dto.isLastChunk) {
      await this.completeRecording(dto.recordingId, userId);
    }

    return chunk;
  }

  async completeRecording(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findFirst({
      where: { id: recordingId, userId },
      include: { chunks: true },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    // Calculate total size and duration
    const totalSize = recording.chunks.reduce(
      (sum, chunk) => sum + chunk.size,
      0,
    );
    const chunkCount = recording.chunks.length;

    await this.prisma.recording.update({
      where: { id: recordingId },
      data: {
        status: RecordingStatus.COMPLETED,
        totalSize,
        completedAt: new Date(),
        // Estimate duration based on chunk count (rough estimate)
        duration: chunkCount * 1, // 1 second per chunk estimate
      },
    });

    return this.getRecording(recordingId, userId);
  }

  // Get specific recording
  async getRecording(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findFirst({
      where: { id: recordingId, userId },
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            size: true,
            duration: true,
            mimeType: true,
            timestamp: true,
          },
          orderBy: { chunkIndex: 'asc' },
        },
      },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }

  // Get audio chunks for playback
  async getRecordingChunks(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findFirst({
      where: { id: recordingId, userId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    const chunks = await this.prisma.audioChunk.findMany({
      where: { recordingId },
      select: {
        id: true,
        chunkIndex: true,
        audioData: true,
        mimeType: true,
        size: true,
      },
      orderBy: { chunkIndex: 'asc' },
    });

    return chunks;
  }

  // Delete recording
  async deleteRecording(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findFirst({
      where: { id: recordingId, userId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    await this.prisma.recording.delete({
      where: { id: recordingId },
    });

    return { message: 'Recording deleted successfully' };
  }

  // Cancel active recording
  async cancelRecording(recordingId: string, userId: string) {
    const recording = await this.prisma.recording.findFirst({
      where: { id: recordingId, userId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    await this.prisma.recording.update({
      where: { id: recordingId },
      data: { status: RecordingStatus.FAILED },
    });

    return { message: 'Recording cancelled' };
  }

  // Get user's recordings
  async getUserRecordings(userId: string) {
    const recordings = await this.prisma.recording.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        duration: true,
        status: true,
        format: true,
        totalSize: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return recordings;
  }
}

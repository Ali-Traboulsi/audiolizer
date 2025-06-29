import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecordingService } from './recording.service';
import { CreateRecordingDto, UploadChunkDto } from './Dto/recording.dto';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('recordings')
@UseGuards(AuthGuard('jwt'))
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post()
  async createRecording(
    @Request() req,
    @Body() createRecordingDto: CreateRecordingDto,
  ) {
    return {
      success: true,
      message: 'Recording created successfully',
      data: await this.createRecordingWithUser(req, createRecordingDto),
    };
  }

  private async createRecordingWithUser(
    req: any,
    createRecordingDto: CreateRecordingDto,
  ) {
    return this.recordingService.createRecording({
      createRecordingDto,
      userId: req.user.id,
    });
  }

  @Post(':id/chunks')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadChunk(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') recordingId: string,
    @Body() uploadChunkDto: UploadChunkDto,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    const chunk = await this.recordingService.uploadChunk(
      req.user.id,
      {
        recordingId,
        chunkIndex: parseInt(uploadChunkDto.chunkIndex.toString()),
        isLastChunk: uploadChunkDto.isLastChunk === true,
      },
      file.buffer,
      file.mimetype,
    );

    return {
      success: true,
      message: 'Chunk uploaded successfully',
      data: {
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        size: chunk.size,
      },
    };
  }

  // Get user's recordings
  @Get()
  async getUserRecordings(@Request() req) {
    const recordings = await this.recordingService.getUserRecordings(
      req.user.id,
    );

    return {
      success: true,
      message: 'Recordings retrieved successfully',
      data: recordings,
    };
  }

  // Get specific recording details
  @Get(':id')
  async getRecording(@Request() req, @Param('id') recordingId: string) {
    const recording = await this.recordingService.getRecording(
      recordingId,
      req.user.id,
    );

    return {
      success: true,
      message: 'Recording retrieved successfully',
      data: recording,
    };
  }

  // Stream recording for playback
  @Get(':id/stream')
  async streamRecording(
    @Request() req,
    @Param('id') recordingId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      console.log(`Streaming recording ${recordingId} for user ${req.user.id}`);

      const chunks = await this.recordingService.getRecordingChunks(
        recordingId,
        req.user.id,
      );

      console.log(`Found ${chunks.length} chunks for recording ${recordingId}`);

      if (chunks.length === 0) {
        console.error(`No audio chunks found for recording ${recordingId}`);
        throw new BadRequestException(
          'No audio chunks found for this recording. Please record new audio.',
        );
      }

      // Log chunk details
      chunks.forEach((chunk, index) => {
        console.log(
          `Chunk ${index}: id=${chunk.id}, index=${chunk.chunkIndex}, size=${chunk.size}, mimeType=${chunk.mimeType}`,
        );
      });

      // Since we're now uploading complete WebM files as single chunks, just serve the first chunk
      const audioChunk = chunks[0]; // Should be the complete recording

      if (!audioChunk.audioData || audioChunk.audioData.length === 0) {
        console.error(`Audio chunk ${audioChunk.id} has no audio data`);
        throw new BadRequestException('Audio data is corrupted or missing');
      }

      console.log(
        `Serving complete recording: size=${audioChunk.size}, mimeType=${audioChunk.mimeType}`,
      );

      res.set({
        'Content-Type': audioChunk.mimeType || 'audio/webm',
        'Content-Length': audioChunk.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range',
      });

      return new StreamableFile(audioChunk.audioData);
    } catch (error) {
      console.error(`Error streaming recording ${recordingId}:`, error);
      throw error;
    }
  }

  // Complete recording
  @Post(':id/complete')
  async completeRecording(@Request() req, @Param('id') recordingId: string) {
    const recording = await this.recordingService.completeRecording(
      recordingId,
      req.user.id,
    );

    return {
      success: true,
      message: 'Recording completed',
      data: recording,
    };
  }

  // Delete recording
  @Delete(':id')
  async deleteRecording(@Request() req, @Param('id') recordingId: string) {
    const result = await this.recordingService.deleteRecording(
      recordingId,
      req.user.id,
    );

    return {
      success: true,
      ...result,
    };
  }

  // Debug endpoint to check recording chunks
  @Get(':id/debug')
  async debugRecording(@Request() req, @Param('id') recordingId: string) {
    const recording = await this.recordingService.getRecording(
      recordingId,
      req.user.id,
    );

    const chunks = await this.recordingService.getRecordingChunks(
      recordingId,
      req.user.id,
    );

    return {
      success: true,
      data: {
        recording: {
          id: recording.id,
          name: recording.name,
          status: recording.status,
          duration: recording.duration,
          format: recording.format,
          totalSize: recording.totalSize,
          chunksCount: recording.chunks?.length || 0,
        },
        chunks: chunks.map((chunk) => ({
          id: chunk.id,
          chunkIndex: chunk.chunkIndex,
          size: chunk.size,
          mimeType: chunk.mimeType,
          hasAudioData: !!chunk.audioData && chunk.audioData.length > 0,
        })),
        totalChunks: chunks.length,
        totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      },
    };
  }
}

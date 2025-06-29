import axios, { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Recording,
  RecordingWithChunks,
  CreateRecordingDto,
} from "@/types";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      timeout: 10000,
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear invalid token and redirect to login
          Cookies.remove("auth_token");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.client.post("/auth/register", credentials);
    return response.data.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.client.post("/auth/login", credentials);
    return response.data.data;
  }

  async getProfile(): Promise<{ user: any }> {
    const response: AxiosResponse<ApiResponse<{ user: any }>> =
      await this.client.get("/auth/profile");
    return response.data.data;
  }

  // Recording endpoints
  async createRecording(data: CreateRecordingDto): Promise<Recording> {
    const response: AxiosResponse<ApiResponse<Recording>> =
      await this.client.post("/recordings", data);
    return response.data.data;
  }

  async uploadChunk(
    recordingId: string,
    audioBlob: Blob,
    chunkIndex: number,
    isLastChunk: boolean
  ): Promise<any> {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("isLastChunk", isLastChunk.toString());

    const response: AxiosResponse<ApiResponse> = await this.client.post(
      `/recordings/${recordingId}/chunks`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  }

  async getRecordings(): Promise<Recording[]> {
    const response: AxiosResponse<ApiResponse<Recording[]>> =
      await this.client.get("/recordings");
    return response.data.data;
  }

  async getRecording(recordingId: string): Promise<RecordingWithChunks> {
    const response: AxiosResponse<ApiResponse<RecordingWithChunks>> =
      await this.client.get(`/recordings/${recordingId}`);
    return response.data.data;
  }

  async completeRecording(recordingId: string): Promise<Recording> {
    const response: AxiosResponse<ApiResponse<Recording>> =
      await this.client.post(`/recordings/${recordingId}/complete`);
    return response.data.data;
  }

  async deleteRecording(recordingId: string): Promise<void> {
    await this.client.delete(`/recordings/${recordingId}`);
  }

  async getRecordingStream(recordingId: string): Promise<string> {
    try {
      const response = await this.client.get(
        `/recordings/${recordingId}/stream`,
        {
          responseType: "blob",
          timeout: 30000, // 30 second timeout
        }
      );

      // Validate that we got a valid blob
      if (!response.data || response.data.size === 0) {
        throw new Error("Received empty audio data");
      }

      return URL.createObjectURL(response.data);
    } catch (error: any) {
      console.error("Failed to fetch audio stream:", error);
      throw new Error("Failed to load audio stream");
    }
  }
}

export const apiClient = new ApiClient();

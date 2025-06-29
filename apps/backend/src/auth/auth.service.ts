import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { IAuthResponse, IJwtPayload } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<IAuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Generate JWT token
      const payload: IJwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        access_token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const payload: IJwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        access_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async validateUser(payload: IJwtPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return null;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('User validation error:', error);
      return null;
    }
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new JWT token
      const payload: IJwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(payload);

      return { access_token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Token refresh error:', error);
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async findUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Find user by ID error:', error);
      return null;
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  async getUserRecordings(userId: string) {
    try {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return recordings;
    } catch (error) {
      console.error('Get user recordings error:', error);
      throw new InternalServerErrorException('Failed to fetch recordings');
    }
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(
        registerDto.email,
        registerDto.password,
      );
      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            createdAt: result.user.createdAt,
          },
          access_token: result.access_token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      const result = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            createdAt: result.user.createdAt,
          },
          access_token: result.access_token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
    };
  }

  @Post('validate-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async validateToken(@Request() req) {
    return {
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    };
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    try {
      const result = await this.authService.refreshToken(req.user.id);
      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: result.access_token,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      let message = 'Unauthorized access';

      if (info?.name === 'TokenExpiredError') {
        message = 'Token has expired';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      } else if (info?.name === 'NotBeforeError') {
        message = 'Token not active';
      }

      throw new UnauthorizedException(message);
    }

    return user;
  }
}

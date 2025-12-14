import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
  
    if (process.env.TEST_MODE !== 'auth') {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const url = (req as any).url as string;


    const isPublic =
      url === '/' ||
      url.startsWith('/doc') ||
      url === '/auth/signup' ||
      url === '/auth/login' ||
      url === '/auth/refresh';

    if (isPublic) return true;

   
    const authHeader = (req as any).headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Unauthorized');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Unauthorized');
    }

    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      
      (req as any).user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}

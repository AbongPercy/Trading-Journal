import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  username: string;
}

/**
 * passport-jwt strategy: every request with a valid "Authorization:
 * Bearer <token>" header lands here. The validated payload becomes
 * req.user, available in controllers via @Req() or @CurrentUser().
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me',
    });
  }

  validate(payload: JwtPayload) {
    if (!payload || typeof payload.sub !== 'number') {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, username: payload.username };
  }
}
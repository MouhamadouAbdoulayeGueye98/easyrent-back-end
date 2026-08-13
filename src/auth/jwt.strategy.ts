import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'deukway-secret-key-a-changer-plus-tard',
    } as any);
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // On remet bien userId ici pour que req.user.userId fonctionne dans ton contrôleur !
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
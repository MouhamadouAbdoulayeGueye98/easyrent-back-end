import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    } as any);
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Votre compte est désactivé. Veuillez contacter l’administrateur.',
      );
    }

    // On conserve userId pour ne pas casser tes contrôleurs existants
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
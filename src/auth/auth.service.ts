import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // Modification pour accepter un objet de données global (dto)
  async register(data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
    phone?: string;
    city?: string;
    publisherType?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Conversion du rôle mobile vers l'Enum Prisma
    let userRole: Role = Role.CLIENT;
    if (data.role === 'publisher' || data.role === 'ANNONCEUR') {
      userRole = Role.ANNONCEUR;
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || '',
        role: userRole,
        phone: data.phone,
        city: data.city,
        publisherType: data.publisherType,
      },
    });

    return this.generateToken(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateToken(user.id, user.email, user.role);
  }

  private generateToken(id: string, email: string, role: string) {
    const payload = { sub: id, email, role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async getProfile(userId: string) {
    // Si userId arrive undefined ici, Prisma plante !
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        publisherType: true,
        createdAt: true,
      },
    });
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Ne pas révéler si l'adresse existe
    if (!user) {
      return {
        message:
          'Si un compte existe avec cette adresse email, un lien de réinitialisation sera envoyé.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');

    const hashedToken = createHash('sha256').update(resetToken).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    // Envoi réel de l'email
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Le lien de réinitialisation est invalide ou expiré.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });

    return {
      message: 'Mot de passe réinitialisé avec succès.',
    };
  }
}

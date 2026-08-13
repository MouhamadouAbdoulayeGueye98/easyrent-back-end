import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
  const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictException('Email déjà utilisé');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Conversion du rôle mobile vers l'Enum Prisma
  let userRole: Role = Role.LOCATAIRE;
  if (data.role === 'publisher' || data.role === 'PROPRIETAIRE') {
    userRole = Role.PROPRIETAIRE;
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
}
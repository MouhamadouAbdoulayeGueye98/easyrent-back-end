import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    propertyId: string,
    date: Date,
  ) {
    const property = await this.prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!property) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (property.ownerId === tenantId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas demander une visite de votre propre annonce',
      );
    }

    const existing = await this.prisma.visitRequest.findFirst({
      where: {
        propertyId,
        tenantId,
        status: 'PENDING',
      },
    });

    if (existing) {
      throw new ConflictException(
        'Une demande de visite est déjà en attente',
      );
    }

    const visit = await this.prisma.visitRequest.create({
      data: {
        propertyId,
        tenantId,
        ownerId: property.ownerId,
        date,
      },
    });

    await this.prisma.notification.create({
      data: {
        title: 'Nouvelle demande de visite',
        message: 'Un utilisateur souhaite visiter votre propriété',
        type: 'VISIT',
        userId: property.ownerId,
      },
    });

    return visit;
  }

  async findAllForUser(userId: string) {
    return this.prisma.visitRequest.findMany({
      where: {
        OR: [
          { tenantId: userId },
          { ownerId: userId },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            photos: {
              take: 1,
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async accept(visitId: string, ownerId: string) {
    const visit = await this.prisma.visitRequest.findUnique({
      where: {
        id: visitId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Demande de visite introuvable');
    }

    if (visit.ownerId !== ownerId) {
      throw new ForbiddenException(
        "Vous n'êtes pas le propriétaire de cette annonce",
      );
    }

    if (visit.status !== 'PENDING') {
      throw new ConflictException(
        'Cette demande de visite a déjà été traitée',
      );
    }

    const updatedVisit = await this.prisma.visitRequest.update({
      where: {
        id: visitId,
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    await this.prisma.notification.create({
      data: {
        title: 'Demande de visite acceptée',
        message: 'Votre demande de visite a été acceptée',
        type: 'VISIT',
        userId: visit.tenantId,
      },
    });

    return updatedVisit;
  }

  async refuse(visitId: string, ownerId: string) {
    const visit = await this.prisma.visitRequest.findUnique({
      where: {
        id: visitId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Demande de visite introuvable');
    }

    if (visit.ownerId !== ownerId) {
      throw new ForbiddenException(
        "Vous n'êtes pas le propriétaire de cette annonce",
      );
    }

    if (visit.status !== 'PENDING') {
      throw new ConflictException(
        'Cette demande de visite a déjà été traitée',
      );
    }

    const updatedVisit = await this.prisma.visitRequest.update({
      where: {
        id: visitId,
      },
      data: {
        status: 'REFUSED',
      },
    });

    await this.prisma.notification.create({
      data: {
        title: 'Demande de visite refusée',
        message: 'Votre demande de visite a été refusée',
        type: 'VISIT',
        userId: visit.tenantId,
      },
    });

    return updatedVisit;
  }
}
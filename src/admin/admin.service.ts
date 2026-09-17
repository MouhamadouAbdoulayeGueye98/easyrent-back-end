import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalClients,
      totalAnnonceurs,
      totalAdmins,

      totalProperties,
      pendingProperties,
      validatedProperties,
      refusedProperties,
      suspendedProperties,

      totalVisits,
      pendingVisits,
      acceptedVisits,
      refusedVisits,
    ] = await Promise.all([
      // Utilisateurs
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          role: 'CLIENT',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'ANNONCEUR',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'ADMIN',
        },
      }),

      // Annonces
      this.prisma.property.count(),

      this.prisma.property.count({
        where: {
          status: 'EN_ATTENTE',
        },
      }),

      this.prisma.property.count({
        where: {
          status: 'VALIDEE',
        },
      }),

      this.prisma.property.count({
        where: {
          status: 'REFUSEE',
        },
      }),

      this.prisma.property.count({
        where: {
          status: 'SUSPENDUE',
        },
      }),

      // Visites
      this.prisma.visitRequest.count(),

      this.prisma.visitRequest.count({
        where: {
          status: 'PENDING',
        },
      }),

      this.prisma.visitRequest.count({
        where: {
          status: 'ACCEPTED',
        },
      }),

      this.prisma.visitRequest.count({
        where: {
          status: 'REFUSED',
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        annonceurs: totalAnnonceurs,
        admins: totalAdmins,
      },

      properties: {
        total: totalProperties,
        pending: pendingProperties,
        validated: validatedProperties,
        refused: refusedProperties,
        suspended: suspendedProperties,
      },

      visits: {
        total: totalVisits,
        pending: pendingVisits,
        accepted: acceptedVisits,
        refused: refusedVisits,
      },
    };
  }

  async getUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      city: true,
      publisherType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getUserById(id: string) {
  return this.prisma.user.findUnique({
    where: {
      id,
    },
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
}

async updateUserStatus(id: string, isActive: boolean) {
  return this.prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      city: true,
      publisherType: true,
      isActive: true,
      createdAt: true,
    },
  });
}
}
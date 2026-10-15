import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parsePagination, buildPaginated } from './pagination.util';
import {
  AdminListQuery,
  buildUserWhere,
  buildPropertyWhere,
  buildVisitWhere,
} from './admin.filters';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [users, properties, visits] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.property.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.visitRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const userStats = users.reduce((acc, curr) => {
      acc[curr.role] = curr._count;
      acc.total += curr._count;
      return acc;
    }, { total: 0, CLIENT: 0, ANNONCEUR: 0, ADMIN: 0 });

    const propertyStats = properties.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      acc.total += curr._count;
      return acc;
    }, { total: 0, EN_ATTENTE: 0, VALIDEE: 0, REFUSEE: 0, SUSPENDUE: 0 });

    const visitStats = visits.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      acc.total += curr._count;
      return acc;
    }, { total: 0, PENDING: 0, ACCEPTED: 0, REFUSED: 0 });

    return {
      users: {
        total: userStats.total,
        clients: userStats.CLIENT,
        annonceurs: userStats.ANNONCEUR,
        admins: userStats.ADMIN,
      },
      properties: {
        total: propertyStats.total,
        pending: propertyStats.EN_ATTENTE,
        validated: propertyStats.VALIDEE,
        refused: propertyStats.REFUSEE,
        suspended: propertyStats.SUSPENDUE,
      },
      visits: {
        total: visitStats.total,
        pending: visitStats.PENDING,
        accepted: visitStats.ACCEPTED,
        refused: visitStats.REFUSED,
      },
    };
  }

  async getUsers(query: AdminListQuery) {
    const pagination = parsePagination(query.page, query.limit);
    const where = buildUserWhere(query);

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginated(users, total, pagination);
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
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

  async getProperties(query: AdminListQuery) {
    const pagination = parsePagination(query.page, query.limit);
    const where = buildPropertyWhere(query);

    const [properties, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          photos: {
            select: { id: true, url: true },
            take: 1,
          },
          _count: {
            select: {
              photos: true,
              favorites: true,
              visitRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return buildPaginated(properties, total, pagination);
  }

  async getPropertyById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            city: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        favorites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        visitRequests: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            photos: true,
            favorites: true,
            visitRequests: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Annonce introuvable');
    }

    return property;
  }

  async updatePropertyStatus(id: string, status: string) {
    return this.prisma.property.update({
      where: { id },
      data: { status: status as any },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            photos: true,
            favorites: true,
            visitRequests: true,
          },
        },
      },
    });
  }

  async getVisits(query: AdminListQuery) {
    const pagination = parsePagination(query.page, query.limit);
    const where = buildVisitWhere(query);

    const [visits, total] = await this.prisma.$transaction([
      this.prisma.visitRequest.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              type: true,
              price: true,
            },
          },
          tenant: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.visitRequest.count({ where }),
    ]);

    return buildPaginated(visits, total, pagination);
  }

  async getFavorites(query: AdminListQuery) {
    const pagination = parsePagination(query.page, query.limit);

    const [favorites, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.favorite.count(),
    ]);

    return buildPaginated(favorites, total, pagination);
  }
}
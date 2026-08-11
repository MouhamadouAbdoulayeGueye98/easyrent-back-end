import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, ownerId },
    });
  }

  async findAll(search: SearchPropertyDto) {
    return this.prisma.property.findMany({
      where: {
        city: search.city ? { equals: search.city, mode: 'insensitive' } : undefined,
        quartier: search.quartier ? { equals: search.quartier, mode: 'insensitive' } : undefined,
        type: search.type,
        furnished: search.furnished,
        wifiAvailable: search.wifiAvailable,
        parking: search.parking,
        price: {
          gte: search.minPrice,
          lte: search.maxPrice,
        },
        available: true,
      },
      include: { photos: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { photos: true, owner: { select: { id: true, name: true, phone: true } } },
    });
    if (!property) throw new NotFoundException('Annonce introuvable');
    return property;
  }

  async update(id: string, ownerId: string, dto: Partial<CreatePropertyDto>) {
    const property = await this.findOne(id);
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException("Vous n'êtes pas propriétaire de cette annonce");
    }
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  async remove(id: string, ownerId: string) {
    const property = await this.findOne(id);
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException("Vous n'êtes pas propriétaire de cette annonce");
    }
    return this.prisma.property.delete({ where: { id } });
  }

  async addPhoto(propertyId: string, ownerId: string, url: string) {
  const property = await this.findOne(propertyId);
  if (property.ownerId !== ownerId) {
    throw new ForbiddenException("Vous n'êtes pas propriétaire de cette annonce");
  }
  return this.prisma.photo.create({
    data: { url, propertyId },
  });
}

async removePhoto(photoId: string, ownerId: string) {
  const photo = await this.prisma.photo.findUnique({
    where: { id: photoId },
    include: { property: true },
  });
  if (!photo) throw new NotFoundException('Photo introuvable');
  if (photo.property.ownerId !== ownerId) {
    throw new ForbiddenException("Vous n'êtes pas propriétaire de cette annonce");
  }
  return this.prisma.photo.delete({ where: { id: photoId } });
}
}
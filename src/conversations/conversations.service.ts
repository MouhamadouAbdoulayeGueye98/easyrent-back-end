import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateForProperty(propertyId: string, tenantId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (property.ownerId === tenantId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas discuter avec vous-même',
      );
    }

    const existing = await this.prisma.conversation.findUnique({
      where: {
        propertyId_tenantId: {
          propertyId,
          tenantId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.conversation.create({
      data: {
        propertyId,
        tenantId,
        ownerId: property.ownerId,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ ownerId: userId }, { tenantId: userId }],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            photos: {
              take: 1,
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    if (
      conversation.ownerId !== userId &&
      conversation.tenantId !== userId
    ) {
      throw new ForbiddenException('Accès refusé à cette conversation');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    if (
      conversation.ownerId !== senderId &&
      conversation.tenantId !== senderId
    ) {
      throw new ForbiddenException('Accès refusé à cette conversation');
    }

    const receiverId =
      conversation.ownerId === senderId
        ? conversation.tenantId
        : conversation.ownerId;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.prisma.notification.create({
      data: {
        title: 'Nouveau message',
        message: `${message.sender.name} vous a envoyé un message`,
        type: 'MESSAGE',
        userId: receiverId,
      },
    });

    return message;
  }
}

import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

interface CreateSupportDto {
  subject: string;
  message: string;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createTicket(userId: string, data: CreateSupportDto) {
    const subject = data.subject?.trim();
    const message = data.message?.trim();

    if (!subject || !message) {
      throw new BadRequestException(
        'Le sujet et le message sont obligatoires.',
      );
    }

    if (subject.length > 150) {
      throw new BadRequestException(
        'Le sujet ne doit pas dépasser 150 caractères.',
      );
    }

    if (message.length < 10 || message.length > 5000) {
      throw new BadRequestException(
        'Le message doit contenir entre 10 et 5000 caractères.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable.');
    }

    // 1. Enregistrement de la demande dans PostgreSQL
    const ticket = await this.prisma.supportTicket.create({
      data: {
        subject,
        message,
        userId: user.id,
      },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

      // Notification de l'équipe support
      try {
          await this.mailService.sendSupportEmail({
              name: user.name || 'Utilisateur Easy Rent',
              email: user.email,
              subject,
              message,
          });
      } catch (error) {
          this.logger.error(
              `Échec de l'envoi de l'e-mail au support pour le ticket ${ticket.id}`,
              error instanceof Error ? error.stack : String(error),
          );
      }

      // Confirmation automatique envoyée à l'utilisateur
      try {
          await this.mailService.sendSupportConfirmationEmail({
              name: user.name || 'Utilisateur Easy Rent',
              email: user.email,
              ticketId: ticket.id,
              subject,
          });
      } catch (error) {
          this.logger.error(
              `Échec de l'envoi de la confirmation au client pour le ticket ${ticket.id}`,
              error instanceof Error ? error.stack : String(error),
          );
      }

    return {
      message:
        'Votre demande a bien été enregistrée. Notre équipe vous répondra dès que possible.',
      ticket,
    };
  }

  // Récupérer les demandes de l'utilisateur connecté
  async getMyTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `easyrent://auth/reset-password?token=${resetToken}`;

    await this.transporter.sendMail({
      from: `"Easy Rent" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Easy Rent',

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Réinitialisation du mot de passe</h2>

          <p>Bonjour,</p>

          <p>
            Vous avez demandé la réinitialisation de votre mot de passe
            Easy Rent.
          </p>

          <p>
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot
            de passe :
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #2563EB;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Réinitialiser mon mot de passe
          </a>

          <p style="margin-top: 20px;">
            Ce lien est valable pendant 15 minutes.
          </p>

          <p>
            Si vous n'êtes pas à l'origine de cette demande,
            vous pouvez ignorer cet email.
          </p>

          <p>
            L'équipe Easy Rent
          </p>
        </div>
      `,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async sendSupportEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const safeName = this.escapeHtml(data.name);
    const safeEmail = this.escapeHtml(data.email);
    const safeSubject = this.escapeHtml(data.subject);
    const safeMessage = this.escapeHtml(data.message).replace(/\n/g, '<br>');

    await this.transporter.sendMail({
      from: `"Easy Rent" <${process.env.MAIL_FROM}>`,
      to: 'mouhagueyegueye@gmail.com',
      replyTo: data.email,
      subject: `[Easy Rent Support] ${data.subject}`,

      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2563EB;">Nouvelle demande d'assistance</h2>

        <p><strong>Nom :</strong> ${safeName}</p>
        <p><strong>Email :</strong> ${safeEmail}</p>
        <p><strong>Sujet :</strong> ${safeSubject}</p>

        <hr />

        <h3>Message :</h3>
        <p style="line-height: 1.6;">${safeMessage}</p>

        <hr />

        <p style="color: #64748B;">Demande envoyée depuis l'application Easy Rent.</p>
      </div>
    `,
    });
  }

  async sendSupportConfirmationEmail(data: {
    name: string;
    email: string;
    ticketId: string;
    subject: string;
  }) {
    const safeName = this.escapeHtml(data.name);
    const safeSubject = this.escapeHtml(data.subject);
    const safeTicketId = this.escapeHtml(data.ticketId);

    await this.transporter.sendMail({
      from: `"Easy Rent" <${process.env.MAIL_FROM}>`,
      to: data.email,
      subject: 'Nous avons bien reçu votre demande - Easy Rent',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <div style="background: #2563EB; padding: 25px; text-align: center; color: white;">
          <h1 style="margin: 0;">Easy Rent</h1>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2>Bonjour ${safeName},</h2>

          <p>
            Nous vous confirmons que votre demande a bien été reçue
            par notre équipe support.
          </p>

          <div style="background: #f3f4f6; padding: 18px; border-radius: 8px;">
            <p><strong>Numéro de ticket :</strong> ${safeTicketId}</p>
            <p><strong>Sujet :</strong> ${safeSubject}</p>
            <p><strong>Statut :</strong> En attente de traitement</p>
          </div>

          <p>
            Notre équipe prendra connaissance de votre demande et vous
            répondra dans les meilleurs délais.
          </p>

          <p>Merci de faire confiance à Easy Rent !</p>

          <p style="margin-top: 30px;">
            Cordialement,<br />
            <strong>L'équipe Easy Rent</strong>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          Cet e-mail est envoyé automatiquement. Merci de ne pas y répondre.
        </div>
      </div>
    `,
    });
  }
}
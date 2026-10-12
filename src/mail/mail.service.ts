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

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ) {
    const resetUrl =
      `easyrent://auth/reset-password?token=${resetToken}`;

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
}
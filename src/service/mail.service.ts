import { errorService } from "./errors.service";

import { httpResponse } from "./response.service";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { endTemplate, startTemplate } from "./template-html";
import prisma from "../prisma";

class MailService {
  async sendMail(mailTo: string, password: string) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "crosschexclouddmax@gmail.com",
          pass: "jn7jnAPss4f63QBp6D",
        },
      });
      await transporter.sendMail({
        from: "crosschexclouddmax@gmail.com",
        to: mailTo,
        subject: "Solicitud de cambio de contraseña",
        text: "",
        html: startTemplate + password + endTemplate,
      });
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async resetPassword() {
    try {
      const superadmin = await prisma.user.findFirst({
        where: { role: "superadmin" },
      });

      let segundos = new Date().getSeconds().toString();

      let caracteres =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      let parteAleatoria = "";
      for (let i = 0; i < 8; i++) {
        parteAleatoria += caracteres.charAt(
          Math.floor(Math.random() * caracteres.length)
        );
      }

      let newPassowrd = parteAleatoria + segundos;

      const newPasswordHash = bcrypt.hashSync(newPassowrd, 11);

      if (superadmin) {
        await prisma.user.update({
          where: { id: superadmin.id },
          data: { password: newPasswordHash },
        });

        await prisma.$disconnect();

        await this.sendMail(superadmin.email, newPassowrd);
        return httpResponse.http200("Reset password ok");
      }

      await prisma.$disconnect();

      return httpResponse.http401("Error");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }
}

export const mailService = new MailService();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const template_html_1 = require("./template-html");
const prisma_1 = __importDefault(require("../prisma"));
class MailService {
    sendMail(mailTo, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "crosschexclouddmax@gmail.com",
                        pass: "jn7jnAPss4f63QBp6D",
                    },
                });
                yield transporter.sendMail({
                    from: "crosschexclouddmax@gmail.com",
                    to: mailTo,
                    subject: "Solicitud de cambio de contraseña",
                    text: "",
                    html: template_html_1.startTemplate + password + template_html_1.endTemplate,
                });
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    resetPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const superadmin = yield prisma_1.default.user.findFirst({
                    where: { role: "superadmin" },
                });
                let segundos = new Date().getSeconds().toString();
                let caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let parteAleatoria = "";
                for (let i = 0; i < 8; i++) {
                    parteAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
                }
                let newPassowrd = parteAleatoria + segundos;
                const newPasswordHash = bcrypt_1.default.hashSync(newPassowrd, 11);
                if (superadmin) {
                    yield prisma_1.default.user.update({
                        where: { id: superadmin.id },
                        data: { password: newPasswordHash },
                    });
                    yield prisma_1.default.$disconnect();
                    yield this.sendMail(superadmin.email, newPassowrd);
                    return response_service_1.httpResponse.http200("Reset password ok");
                }
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http401("Error");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.mailService = new MailService();

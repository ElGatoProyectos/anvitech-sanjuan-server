"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUserDTO = exports.updateUserDTO = exports.createUserDTO = void 0;
const zod_1 = require("zod");
exports.createUserDTO = zod_1.z.object({
    dni: zod_1.z.string().min(8, "DNI es requerido"),
    full_name: zod_1.z.string().min(1, "El nombre completo es requerido"),
    email: zod_1.z.string().email("Email no es válido"),
});
exports.updateUserDTO = zod_1.z.object({
    dni: zod_1.z.string().min(8, "Minimo 8").optional(),
    full_name: zod_1.z.string().min(5, "Minimo 5").optional(),
    email: zod_1.z.string().email("Email no es válido").optional(),
    username: zod_1.z.string().min(1, "El nombre de usuario es requerido").optional(),
    password: zod_1.z.string().min(1, "La contraseña es requerida").optional(),
    role: zod_1.z.string().min(1, "El rol es requerido").optional(),
    enabled: zod_1.z.boolean().optional(),
});
exports.formatUserDTO = zod_1.z.object({
    dni: zod_1.z.number().min(8, "Minimo 8"),
    nombres: zod_1.z.string().min(5, "Minimo 5"),
    celular: zod_1.z.number().min(5, "Minimo 5"),
    correo: zod_1.z.string().email("Correo no valido"),
    rol: zod_1.z.string().min(3, "Correo no valido"),
});

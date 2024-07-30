"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSheduleDto = void 0;
const zod_1 = require("zod");
exports.formatSheduleDto = zod_1.z.object({
    dni: zod_1.z.string().min(8, "DNI es requerido"),
    lunes: zod_1.z.string().min(11, "Error en el formato"),
    martes: zod_1.z.string().min(11, "Error en el formato"),
    miercoles: zod_1.z.string().min(11, "Error en el formato"),
    jueves: zod_1.z.string().min(11, "Error en el formato"),
    viernes: zod_1.z.string().min(11, "Error en el formato"),
    sabado: zod_1.z.string().min(11, "Error en el formato"),
    domingo: zod_1.z.string().min(11, "Error en el formato"),
});

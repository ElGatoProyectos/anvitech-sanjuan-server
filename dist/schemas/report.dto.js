"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReportFileDTO = void 0;
const zod_1 = require("zod");
exports.formatReportFileDTO = zod_1.z.object({
    dni: zod_1.z.string().regex(/^\d{8}$/, "DNI debe tener 8 dígitos"),
    fecha_reporte: zod_1.z.string().nonempty("Fecha de reporte es requerida"),
    hora_inicio: zod_1.z.string().nonempty("Fecha de inicio es requerida"),
    hora_inicio_refrigerio: zod_1.z
        .string()
        .nonempty("Fecha de inicio de refrigerio es requerida"),
    hora_fin_refrigerio: zod_1.z
        .string()
        .nonempty("Fecha de fin de refrigerio es requerida"),
    hora_salida: zod_1.z.string().nonempty("Hora de salida es requerida"),
});

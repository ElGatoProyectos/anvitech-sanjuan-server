"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkerDTO = void 0;
const zod_1 = require("zod");
exports.createWorkerDTO = zod_1.z.object({
    full_name: zod_1.z.string().min(5, "El campo full_name es requerido"),
    dni: zod_1.z.string().min(8, "DNI es requerido"),
    department: zod_1.z.string().min(5, "El campo department es requerido"),
    position: zod_1.z.string().min(5, "El campo position es requerido"),
    hire_date: zod_1.z.string().min(5, "El campo hire_date es requerido"),
});

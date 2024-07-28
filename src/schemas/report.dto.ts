import { z } from "zod";

export const formatReportFileDTO = z.object({
  dni: z.string().regex(/^\d{8}$/, "DNI debe tener 8 dígitos"),
  fecha_reporte: z.string().nonempty("Fecha de reporte es requerida"),
  hora_inicio: z.string().nonempty("Fecha de inicio es requerida"),
  hora_inicio_refrigerio: z
    .string()
    .nonempty("Fecha de inicio de refrigerio es requerida"),
  hora_fin_refrigerio: z
    .string()
    .nonempty("Fecha de fin de refrigerio es requerida"),
  hora_salida: z.string().nonempty("Hora de salida es requerida"),
});

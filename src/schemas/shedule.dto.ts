import { z } from "zod";
export const formatSheduleDto = z.object({
  dni: z.string().min(8, "DNI es requerido"),
  lunes: z.string().min(11, "Error en el formato"),
  martes: z.string().min(11, "Error en el formato"),
  miercoles: z.string().min(11, "Error en el formato"),
  jueves: z.string().min(11, "Error en el formato"),
  viernes: z.string().min(11, "Error en el formato"),
  sabado: z.string().min(11, "Error en el formato"),
  domingo: z.string().min(11, "Error en el formato"),
});

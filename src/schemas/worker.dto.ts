import { z } from "zod";
export const createWorkerDTO = z.object({
  full_name: z.string().min(5, "El campo full_name es requerido"),
  dni: z.string().min(8, "DNI es requerido"),
  department: z.string().min(5, "El campo department es requerido"),
  position: z.string().min(5, "El campo position es requerido"),
  hire_date: z.string().min(5, "El campo hire_date es requerido"),
});

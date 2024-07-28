import { z } from "zod";
export const createUserDTO = z.object({
  dni: z.string().min(8, "DNI es requerido"),
  full_name: z.string().min(1, "El nombre completo es requerido"),
  email: z.string().email("Email no es válido"),
});

export const updateUserDTO = z.object({
  dni: z.string().min(8, "Minimo 8").optional(),
  full_name: z.string().min(5, "Minimo 5").optional(),
  email: z.string().email("Email no es válido").optional(),
  username: z.string().min(1, "El nombre de usuario es requerido").optional(),
  password: z.string().min(1, "La contraseña es requerida").optional(),
  role: z.string().min(1, "El rol es requerido").optional(),
  enabled: z.boolean().optional(),
});

export const formatUserDTO = z.object({
  dni: z.number().min(8, "Minimo 8"),
  nombres: z.string().min(5, "Minimo 5"),
  celular: z.number().min(5, "Minimo 5"),
  correo: z.string().email("Correo no valido"),
  rol: z.string().min(3, "Correo no valido"),
});

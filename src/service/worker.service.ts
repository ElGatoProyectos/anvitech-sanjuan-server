import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";
import * as xlsx from "xlsx";
import {
  excelSerialDateToJSDate,
  formatDateForPrisma,
} from "../functions/date-transform";
import { createWorkerDTO } from "../schemas/worker.dto";
import { scheduleService } from "./schedule.service";
import { reportService } from "./report.service";
import prisma from "../prisma";
import { maxWorkers } from "../constants/workers.constant";

class WorkerService {
  async findAll() {
    try {
      const workers = await prisma.worker.findMany();
      await prisma.$disconnect();
      return httpResponse.http200("All workers", workers);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findAllNoDisable() {
    try {
      const workers = await prisma.worker.findMany({
        where: { enabled: "si" },
      });
      await prisma.$disconnect();
      return httpResponse.http200("All workers", workers);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findById(id: number) {
    try {
      const worker = await prisma.worker.findFirst({ where: { id } });
      if (!worker) return httpResponse.http404("Worker not found");
      await prisma.$disconnect();
      return httpResponse.http200("Worker found", worker);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async deleteById(id: number) {
    try {
      const worker = await prisma.worker.findFirst({ where: { id } });

      if (!worker) return httpResponse.http404("Worker not found");

      await prisma.schedule.delete({ where: { worker_id: id } });
      await prisma.detailReport.deleteMany({ where: { dni: worker.dni } });
      await prisma.vacation.deleteMany({ where: { worker_id: worker.id } });
      await prisma.licence.deleteMany({ where: { worker_id: worker.id } });
      await prisma.medicalRest.deleteMany({ where: { worker_id: worker.id } });
      await prisma.permissions.deleteMany({ where: { worker_id: worker.id } });

      await prisma.worker.delete({ where: { id } });

      await prisma.$disconnect();
      return httpResponse.http200("Worker deleted", worker);
    } catch (error) {
      console.log(error);
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  /// registros masivos ok, deben evitarse ingresar registros duplicados en el excel si no ninguno se registrara
  async fileToRegisterMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      //- pendiente la validacion de esquemas con zod

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          const hireDate = excelSerialDateToJSDate(item.fecha_contratacion);
          const formatData = {
            full_name: item.nombres,
            type_contract: item.tipo_contrato,
            dni: item.dni.toString(),
            type_dni: item.tipo_documento,
            department: item.departamento ? item.departamento : "No definido",
            position: item.posicion ? item.posicion : "No definido",
            enabled: item.estado === "ACTIVO" ? "si" : "no",
            hire_date: hireDate.toISOString(),
            supervisor:
              item.supervisor === "" ? "No definido" : item.supervisor,
            coordinator:
              item.coordinador === "" ? "No definido" : item.coordinador,
            management:
              item.gestor_comercial === ""
                ? "No definido"
                : item.gestor_comercial,
          };
          const workers = await prisma.worker.findMany();
          await prisma.$disconnect();
          if (workers.length >= maxWorkers) {
            return httpResponse.http400("Error, trabajadores maximos");
          }
          await prisma.worker.create({ data: formatData });
        })
      );

      /// registrar los horarios por defecto
      const formatSchedule = {
        lunes: "09:00-18:00",
        martes: "09:00-18:00",
        miercoles: "09:00-18:00",
        jueves: "09:00-18:00",
        viernes: "09:00-18:00",
        sabado: "09:00-18:00",
        domingo: "",
        type: "default",
      };

      const { content: workers } = await this.findAll();
      await Promise.all(
        workers.map(async (w: any) => {
          const wFormat = {
            ...formatSchedule,
            worker_id: w.id,
          };
          await scheduleService.createScheduleMassive(wFormat);
        })
      );

      await prisma.$disconnect();
      return httpResponse.http201("Workers created");
    } catch (error) {
      console.log(error);
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async create(data: any) {
    try {
      const workers = await prisma.worker.findMany();
      await prisma.$disconnect();
      if (workers.length >= maxWorkers) {
        return httpResponse.http400("Error, trabajadores maximos");
      }
      createWorkerDTO.parse(data);

      const formatData = {
        ...data,
        hire_date: formatDateForPrisma(data.hire_date),
      };
      const created = await prisma.worker.create({ data: formatData });
      await prisma.$disconnect();
      return httpResponse.http201("Worker created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async createNoHireDate(data: any) {
    try {
      const workers = await prisma.worker.findMany();
      if (workers.length >= maxWorkers) {
        return httpResponse.http400();
      }
      const created = await prisma.worker.create({ data });
      await prisma.$disconnect();
      return httpResponse.http201("Worker created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findDepartmentDistinct() {
    try {
      const departments = await prisma.worker.findMany({
        distinct: ["department"],
        select: {
          department: true,
        },
      });
      await prisma.$disconnect();
      return httpResponse.http200("Departments distinct", departments);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findByDNI(dni: string) {
    try {
      const worker = await prisma.worker.findFirst({
        where: { dni: dni },
      });
      await prisma.$disconnect();
      if (!worker) return httpResponse.http400("Worker not found");
      return httpResponse.http200("Worker found", worker);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async updateTerminationDate(data: any, workerId: number) {
    try {
      if (data.restore) {
        const worker = await prisma.worker.update({
          where: { id: workerId },
          data: {
            termination_date: null,
            reason: "",
            enabled: "si",
          },
        });

        return httpResponse.http200("Worker updated", worker);
      } else {
        const worker = await prisma.worker.update({
          where: { id: workerId },
          data: {
            termination_date: new Date(data.termination_date),
            reason: data.reason,
            enabled: "no",
          },
        });

        const formatDate = new Date(data.termination_date);
        formatDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(formatDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // borra datos del mismo dia
        await prisma.detailReport.deleteMany({
          where: { dni: worker.dni, fecha_reporte: { gte: nextDay } },
        });
        await prisma.$disconnect();
        return httpResponse.http200("Worker updated", worker);
      }
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async updateWorker(data: any, workerId: number) {
    try {
      const { hire_date, id, ...restData } = data;

      const formatData = {
        ...restData,
        hire_date: new Date(hire_date),
      };
      const updated = await prisma.worker.update({
        where: { id: workerId },
        data: formatData,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Worker updated", updated);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerTerminationMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          const dateFormat = excelSerialDateToJSDate(item.fecha_cese);

          if (item.dni === "" || item.fecha_cese === "")
            throw new Error("Error in service");

          await prisma.worker.update({
            where: { dni: String(item.dni) },
            data: {
              termination_date: dateFormat,
              reason: item.motivo,
              enabled: "no",
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Updated");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async updateSupervisorMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          if (item.dni === "") throw new Error("Error in service");

          await prisma.worker.update({
            where: { dni: String(item.dni) },
            data: {
              supervisor: item.supervisor,
              coordinator: item.coordinador,
              management: item.generate_comercial,
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Updated");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerVacationMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          if (
            item.dni === "" ||
            item.fecha_inicio === "" ||
            item.fecha_fin === ""
          )
            throw new Error("Error in service");
          const worker = await workerService.findByDNI(String(item.dni));
          await prisma.vacation.create({
            data: {
              worker_id: worker.content.id,
              start_date: reportService.excelSerialDateToJSDate(
                item.fecha_inicio
              ),
              end_date: reportService.excelSerialDateToJSDate(item.fecha_fin),
              reason: item.contexto,
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Register vacation successfull!");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerLincensesMasive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          if (
            item.dni === "" ||
            item.fecha_inicio === "" ||
            item.fecha_fin === ""
          )
            throw new Error("Error in service");
          const worker = await workerService.findByDNI(String(item.dni));
          await prisma.licence.create({
            data: {
              worker_id: worker.content.id,
              start_date: reportService.excelSerialDateToJSDate(
                item.fecha_inicio
              ),
              end_date: reportService.excelSerialDateToJSDate(item.fecha_fin),
              reason: item.contexto,
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Register vacation successfull!");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerMedicalRestMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          if (
            item.dni === "" ||
            item.fecha_inicio === "" ||
            item.fecha_fin === ""
          )
            throw new Error("Error in service");
          const worker = await workerService.findByDNI(String(item.dni));
          await prisma.medicalRest.create({
            data: {
              worker_id: worker.content.id,
              start_date: reportService.excelSerialDateToJSDate(
                item.fecha_inicio
              ),
              end_date: reportService.excelSerialDateToJSDate(item.fecha_fin),
              reason: item.contexto,
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Register vacation successfull!");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerPermissionsMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          if (
            item.dni === "" ||
            item.fecha_inicio === "" ||
            item.fecha_fin === ""
          )
            throw new Error("Error in service");
          const worker = await workerService.findByDNI(String(item.dni));
          await prisma.permissions.create({
            data: {
              worker_id: worker.content.id,
              start_date: reportService.excelSerialDateToJSDate(
                item.fecha_inicio
              ),
              end_date: reportService.excelSerialDateToJSDate(item.fecha_fin),
              reason: item.contexto,
            },
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Register vacation successfull!");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findSupervisors() {
    try {
      const workers = await prisma.worker.findMany({
        where: { type_contract: "SUPERVISOR" },
      });
      await prisma.$disconnect();
      return httpResponse.http200("All workers", workers);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async deleteWorker(workerId: number) {
    try {
      const deleted = await prisma.worker.delete({ where: { id: workerId } });
      await prisma.$disconnect();
      return httpResponse.http200("Delete worker");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }
}

export const workerService = new WorkerService();

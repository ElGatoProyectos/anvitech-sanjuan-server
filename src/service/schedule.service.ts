import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";
import * as xlsx from "xlsx";
import { formatSheduleDto } from "../schemas/shedule.dto";
import { workerService } from "./worker.service";
import prisma from "../prisma";

class ScheduleService {
  async findAll() {
    try {
      const schedules = await prisma.schedule.findMany({
        include: {
          worker: true,
        },
      });
      await prisma.$disconnect();
      return httpResponse.http200("All schedules", schedules);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findScheduleForWorker(workerId: number) {
    try {
      const schedule = await prisma.schedule.findFirst({
        where: { worker_id: workerId },
      });

      if (!schedule) return httpResponse.http404("Schedule not found");
      await prisma.$disconnect();
      return httpResponse.http200("Schedule worker", schedule);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async createScheduleMassive(data: any) {
    try {
      const created = await prisma.schedule.create({ data });
      await prisma.$disconnect();
      return httpResponse.http200("Schedule created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async createScheduleDefault(workerId: number) {
    try {
      const dataSet = {
        worker_id: workerId,
        lunes: "09:00-18:00",
        martes: "09:00-18:00",
        miercoles: "09:00-18:00",
        jueves: "09:00-18:00",
        viernes: "09:00-18:00",
        sabado: "09:00-18:00",
        domingo: "",
        comments: "",
      };

      const created = await prisma.schedule.create({ data: dataSet });
      await prisma.$disconnect();
      return httpResponse.http201("Schedule created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async createScheduleForWorker(data: any) {
    try {
      const dataSet = {
        worker_id: Number(data.workerId),
        lunes: data.schedule[0].hours.start + "-" + data.schedule[0].hours.end,
        martes: data.schedule[1].hours.start + "-" + data.schedule[1].hours.end,
        miercoles:
          data.schedule[2].hours.start + "-" + data.schedule[2].hours.end,
        jueves: data.schedule[3].hours.start + "-" + data.schedule[3].hours.end,
        viernes:
          data.schedule[4].hours.start + "-" + data.schedule[4].hours.end,
        sabado: data.schedule[5].hours.start + "-" + data.schedule[5].hours.end,
        domingo: "",
        comments: data.comments,
      };

      const scheduleResponse = await this.findScheduleForWorker(
        Number(data.workerId)
      );
      if (!scheduleResponse.ok) {
        const created = await prisma.schedule.create({ data: dataSet });
        return httpResponse.http201("Schedule created", created);
      } else {
        const updated = await prisma.schedule.update({
          where: { worker_id: Number(data.workerId) },
          data: dataSet,
        });
        await prisma.$disconnect();
        return httpResponse.http201("Schedule updated", updated);
      }
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async registerMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      const exampleData = sheetToJson[0];

      formatSheduleDto.parse(exampleData);

      await Promise.all(
        sheetToJson.map(async (item: any) => {
          const worker = await workerService.findByDNI(item.dni);

          const format = {
            worker_id: worker.content.id,
            lunes: item.lunes,
            martes: item.martes,
            miercoles: item.miercoles,
            jueves: item.juves,
            viernes: item.viernes,
            sabado: item.sabado,
            domingo: item.domingo,
            comments: "",
            type: "default",
          };

          await prisma.schedule.update({
            where: { worker_id: worker.content.id },
            data: format,
          });
        })
      );
      await prisma.$disconnect();
      return httpResponse.http201("Workers updated");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // =================

  async findTypeSchedule() {
    try {
      const typesSchedules = await prisma.typeSchedule.findMany();
      await prisma.$disconnect();
      return httpResponse.http200("All types schedules", typesSchedules);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async createTypeSchedule(data: any) {
    try {
      const created = await prisma.typeSchedule.create({ data });
      await prisma.$disconnect();
      return httpResponse.http200("Type schedule creayed", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async updateTypeSchedule(typScheduleId: number, data: any) {
    try {
      const updatedTypeSchedule = await prisma.typeSchedule.update({
        where: { id: typScheduleId },
        data,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Type schedule updated", updatedTypeSchedule);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }
}

export const scheduleService = new ScheduleService();

import prisma from "../prisma";
import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";

class MedicalRestService {
  async registerMedicalRest(data: any) {
    try {
      const formatData = {
        ...data,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
      };
      const created = await prisma.medicalRest.create({ data: formatData });
      await prisma.$disconnect();
      return httpResponse.http201("Medical rest created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findLasts(workerId: number) {
    try {
      const data = await prisma.medicalRest.findMany({
        where: { worker_id: workerId },
        orderBy: {
          id: "desc",
        },
        take: 5,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Medical rest ", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findByWorker(workerId: number) {
    try {
      const data = await prisma.medicalRest.findMany({
        where: { worker_id: workerId },
      });
      await prisma.$disconnect();
      return httpResponse.http200("All Medical rest ", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async edit(data: any, medicalRestId: number) {
    try {
      const medicalRest = await prisma.medicalRest.findFirst({
        where: { id: medicalRestId },
      });

      if (!medicalRest) return httpResponse.http400("Error in update");

      const formatData = {
        start_date: data.start_date
          ? new Date(data.start_date)
          : medicalRest.start_date,
        end_date: data.end_date
          ? new Date(data.end_date)
          : medicalRest.end_date,
        reason: data.reason ? data.reason : medicalRest.reason,
      };
      await prisma.medicalRest.update({
        where: { id: medicalRestId },
        data: formatData,
      });
      return httpResponse.http200("Medical rest updated");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async delete(medicalRestId: number) {
    try {
      const medicalRest = await prisma.medicalRest.findFirst({
        where: { id: medicalRestId },
      });

      if (!medicalRest) return httpResponse.http400("Error in deleted");

      await prisma.medicalRest.delete({ where: { id: medicalRestId } });
      return httpResponse.http200("Medical rest deleted");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }
}

export const medicalRestService = new MedicalRestService();

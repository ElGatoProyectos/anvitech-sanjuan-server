import { httpResponse } from "./response.service";
import { errorService } from "./errors.service";
import prisma from "../prisma";

class LicenceService {
  async registerLicence(data: any) {
    try {
      const formatData = {
        ...data,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
      };
      const created = await prisma.licence.create({ data: formatData });
      await prisma.$disconnect();
      return httpResponse.http201("Lincence created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findLasts(workerId: number) {
    try {
      const data = await prisma.licence.findMany({
        where: { worker_id: workerId },
        orderBy: {
          id: "desc",
        },
        take: 5,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Licences", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findByWorker(workerId: number) {
    try {
      const data = await prisma.licence.findMany({
        where: { worker_id: workerId },
      });
      await prisma.$disconnect();
      return httpResponse.http200("All licences", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async edit(data: any, licenseId: number) {
    try {
      const licence = await prisma.licence.findFirst({
        where: { id: licenseId },
      });

      if (!licence) return httpResponse.http400("Error in update");

      const formatData = {
        start_date: data.start_date
          ? new Date(data.start_date)
          : licence.start_date,
        end_date: data.end_date ? new Date(data.end_date) : licence.end_date,
        reason: data.reason ? data.reason : licence.reason,
      };
      await prisma.licence.update({
        where: { id: licenseId },
        data: formatData,
      });
      return httpResponse.http200("License updated");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async delete(licenseId: number) {
    try {
      const licence = await prisma.licence.findFirst({
        where: { id: licenseId },
      });

      if (!licence) return httpResponse.http400("Error in deleted");

      await prisma.licence.delete({ where: { id: licenseId } });
      return httpResponse.http200("License deleted");
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }
}

export const licenceService = new LicenceService();

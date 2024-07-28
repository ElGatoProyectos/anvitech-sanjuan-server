import prisma from "../prisma";
import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";

class TerminationService {
  async findAll() {
    try {
      const terminations = await prisma.typeTermination.findMany();
      await prisma.$disconnect();
      return httpResponse.http200("All terminations", terminations);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async create(data: any) {
    try {
      const terminations = await prisma.typeTermination.create({ data });
      await prisma.$disconnect();
      return httpResponse.http200("Termination created", terminations);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async update(data: any, terminationId: number) {
    try {
      const terminations = await prisma.typeTermination.update({
        where: { id: terminationId },
        data,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Update termination", terminations);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }
}

export const terminationService = new TerminationService();

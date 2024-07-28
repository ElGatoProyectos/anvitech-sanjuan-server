import { httpResponse } from "./response.service";
import { errorService } from "./errors.service";
import prisma from "../prisma";

class IncidentService {
  async findAll() {
    try {
      const incidents = await prisma.incident.findMany();
      await prisma.$disconnect();
      return httpResponse.http200("All incidents", incidents);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findById(id: number) {
    try {
      const incident = await prisma.incident.findFirst({ where: { id } });
      if (!incident) return httpResponse.http404("Incident not found");
      await prisma.$disconnect();
      return httpResponse.http200("Incident found", incident);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async create(data: any) {
    try {
      const formatData = {
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
      };
      const created = await prisma.incident.create({ data: formatData });
      await prisma.$disconnect();
      return httpResponse.http201("Incidente created", created);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async update(data: any, id: number) {
    try {
      const formatData = {
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
      };
      const updated = await prisma.incident.update({
        where: { id },
        data: formatData,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Incident updated", updated);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }
}

export const incidentService = new IncidentService();

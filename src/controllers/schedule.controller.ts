import { Request, Response } from "express";
import { dataService } from "../service/data.service";
import { reportService } from "../service/report.service";
import multer from "multer";
import { scheduleService } from "../service/schedule.service";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class ScheduleController {
  async schedulePost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const serviceResponse = await scheduleService.createScheduleForWorker(
        body
      );

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async scheduleMassiveSchedulePost(
    request: any,
    response: Response
  ): Promise<void> {
    // Usando multer para manejar la subida de archivos en memoria
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await scheduleService.registerMassive(file);

        response.status(200).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async scheduleTypePost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const serviceResponse = await scheduleService.createTypeSchedule(body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async scheduleTypeGet(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await scheduleService.findTypeSchedule();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async scheduleTypeIdPut(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const data = request.body;

      const responseUpdated = await scheduleService.updateTypeSchedule(
        id,
        data
      );

      response.status(responseUpdated.statusCode).json(responseUpdated.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async scheduleWorkerIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);
      const serviceResponse = await scheduleService.findScheduleForWorker(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const scheduleController = new ScheduleController();

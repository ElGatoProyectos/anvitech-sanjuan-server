import { vacationService } from "../service/vacation.service";
import { Request, Response } from "express";

class VacationController {
  async vacationPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;

      const serviceResponse = await vacationService.create(body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async vacationIdPut(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;

      const serviceResponse = await vacationService.edit(body, Number(id));

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async vacationIdDelete(request: Request, response: Response): Promise<void> {
    try {
      const id = request.params.id;

      const serviceResponse = await vacationService.delete(Number(id));

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const vacationController = new VacationController();

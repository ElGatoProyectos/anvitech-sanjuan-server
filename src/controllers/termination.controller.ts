import { terminationService } from "../service/termination.service";
import { Request, Response } from "express";

class TerminationController {
  async terminationsGet(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await terminationService.findAll();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // POST method for creating a termination
  async terminationsPost(request: Request, response: Response): Promise<void> {
    try {
      const data = request.body;
      const serviceResponse = await terminationService.create(data);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async terminationIdPut(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const data = request.body;

      const serviceResponse = await terminationService.update(data, id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const terminationController = new TerminationController();

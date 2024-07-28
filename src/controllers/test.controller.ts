import { dataService } from "../service/data.service";
import { Request, Response } from "express";

class TestController {
  async testGet(request: Request, response: Response): Promise<void> {
    try {
      const date = new Date();
      const serviceResponse = await dataService.instanceDataInit(
        19,
        19,
        2024,
        6
      );

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async testDayPost(request: Request, response: Response): Promise<void> {
    try {
      const { day, month, year } = request.body;

      const serviceResponse = await dataService.instanceDataInit(
        Number(day),
        Number(day),
        Number(year),
        Number(month)
      );

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const testController = new TestController();

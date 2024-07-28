import { Request, Response } from "express";
import { userService } from "../service/user.service";
import { reportService } from "../service/report.service";
import { incidentService } from "../service/incident.service";
import { permissionService } from "../service/permission.service";
import { licenceService } from "../service/licence.service";
import { medicalRestService } from "../service/medical-rest.service";

class Controller {
  // todo used
  async createAdmin(request: Request, response: Response) {
    try {
      const data = request.body;

      const res = await userService.createAdmin(data);
      response.status(200).json(res);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async detailReportPut(request: Request, response: Response) {
    try {
      const id = request.params.id;
      const data = request.body;
      const res = await reportService.updateDetailReport(data, Number(id));
      response.status(200).json(res);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async incidentGet(request: Request, response: Response) {
    try {
      const incidentsResponse = await incidentService.findAll();
      response
        .status(incidentsResponse.statusCode)
        .json(incidentsResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async incidentPost(request: Request, response: Response) {
    try {
      const incident = request.body;
      const responseCreate = await incidentService.create(incident);
      response.status(responseCreate.statusCode).json(responseCreate.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async incidentGetId(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const incidentResponse = await incidentService.findById(id);
      response
        .status(incidentResponse.statusCode)
        .json(incidentResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async incidentPutId(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const incident = request.body;
      const responseUpdated = await incidentService.update(incident, id);
      response.status(responseUpdated.statusCode).json(responseUpdated.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // todo used
  async permissionPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const serviceResponse = await permissionService.create(body);
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async permissionIdPut(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await permissionService.edit(body, Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async permissionIdDelete(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await permissionService.delete(Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async licensePutId(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await licenceService.edit(body, Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async licenseDeleteId(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await licenceService.delete(Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async MedicalRestPutId(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await medicalRestService.edit(body, Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async MedicalRestDeleteId(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;
      const id = request.params.id;
      const serviceResponse = await medicalRestService.delete(Number(id));
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }
}

export const controller = new Controller();

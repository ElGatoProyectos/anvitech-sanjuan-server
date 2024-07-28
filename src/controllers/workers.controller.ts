import { Request, Response } from "express";
import { workerService } from "../service/worker.service";
import multer from "multer";
import { licenceService } from "../service/licence.service";
import { vacationService } from "../service/vacation.service";
import { medicalRestService } from "../service/medical-rest.service";
import { permissionService } from "../service/permission.service";
import { scheduleService } from "../service/schedule.service";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class WorkerController {
  async workerGet(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await workerService.findAll();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // POST method for creating a new worker
  async workerPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const serviceResponse = await workerService.create(body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerIdGet(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);

      const serviceResponse = await workerService.findById(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerIdDelete(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);

      const serviceResponse = await workerService.deleteById(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // PUT method for updating a worker by ID
  async workerIdPut(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const data = request.body;

      const serviceResponse = await workerService.updateWorker(data, id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerDepartmentsGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const serviceResponse = await workerService.findDepartmentDistinct();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json({ errrrrr: error });
    }
  }

  async workerFilePost(request: any, response: Response): Promise<void> {
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
        const serviceResponse = await workerService.fileToRegisterMassive(file);

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerLicencesPost(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;

      const serviceResponse = await licenceService.registerLicence(body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerLicenceIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);
      const serviceResponse = await licenceService.findByWorker(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerLicenceFilePost(request: any, response: Response): Promise<void> {
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
        const serviceResponse = await workerService.registerLincensesMasive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerLicenceMinIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);
      const serviceResponse = await licenceService.findLasts(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerMassiveVacationPost(
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
        const serviceResponse = await vacationService.registerMassive(file);

        response
          .status(serviceResponse.statusCode)
          .json(serviceResponse.content);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerMedicalRestPost(request: Request, response: Response) {
    try {
      // Asumiendo que el cuerpo de la solicitud es JSON
      const body = request.body;

      const serviceResponse = await medicalRestService.registerMedicalRest(
        body
      );

      response.status(200).json(serviceResponse);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerMedicalRestIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await medicalRestService.findByWorker(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerMedicalRestFilePost(
    request: any,
    response: Response
  ): Promise<void> {
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await workerService.registerMedicalRestMassive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerMedicalRestMinGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await medicalRestService.findLasts(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerPermissionFilePost(
    request: any,
    response: Response
  ): Promise<void> {
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await workerService.registerPermissionsMassive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerPermissionIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await permissionService.findByWorker(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerPermissionMinIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await permissionService.findLasts(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerScheduleGet(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await scheduleService.findAll();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerSupervisorGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const serviceResponse = await workerService.findSupervisors();

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerSupervisorFilePost(
    request: any,
    response: Response
  ): Promise<void> {
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await workerService.updateSupervisorMassive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerTerminationFilePost(
    request: any,
    response: Response
  ): Promise<void> {
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await workerService.registerTerminationMassive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  async workerTerminationIdPut(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);
      const body = request.body;

      const serviceResponse = await workerService.updateTerminationDate(
        body,
        workerId
      );

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerVacationIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await vacationService.findByWorker(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerVacationMinIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const workerId = Number(request.params.id);

      const serviceResponse = await vacationService.findLasts(workerId);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async workerVacationFilePost(
    request: any,
    response: Response
  ): Promise<void> {
    upload.single("file")(request, response, async (err) => {
      if (err) {
        return response.status(500).json({ error: "Error uploading file" });
      }

      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      try {
        const serviceResponse = await workerService.registerVacationMassive(
          file
        );

        response.status(serviceResponse.statusCode).json(serviceResponse);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }
}

export const workerController = new WorkerController();

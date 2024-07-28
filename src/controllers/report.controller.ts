import { Request, Response } from "express";
import { dataService } from "../service/data.service";
import { reportService } from "../service/report.service";
import multer from "multer";
import prisma from "../prisma";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class ReportController {
  //todo used
  async reportPost(request: Request, response: Response): Promise<void> {
    try {
      const responseData = await dataService.instanceDataInit();
      response.status(responseData.statusCode).json(responseData);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportGet(request: Request, response: Response): Promise<void> {
    try {
      const responseReports = await reportService.findAll();
      response.status(responseReports.statusCode).json(responseReports.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportForWorkerDNIPost(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const dni = request.params.dni;
      const data = request.body;
      const responseReports = await reportService.generateReportForWorker(
        data,
        dni
      );
      response.status(responseReports.statusCode).json(responseReports.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportIdGet(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const reportResponse = await reportService.findById(id);

      response.status(reportResponse.statusCode).json(reportResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportDayGet(request: Request, response: Response): Promise<void> {
    try {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const serviceResponse = await dataService.instanceDataInit(
        currentDay,
        currentDay,
        currentYear,
        currentMonth,
        false
      );
      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportDayPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;

      const dayBody = Number(body.day);
      const monthBody = Number(body.month) - 1;
      const yearBody = Number(body.year);

      const dateBody = new Date(yearBody, monthBody, dayBody);

      const currentDate = new Date();
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      if (dateBody < currentDateOnly) {
        const serviceResponse = await reportService.generateReportForDayNoToday(
          dayBody,
          monthBody + 1,
          yearBody
        );
        response
          .status(serviceResponse.statusCode)
          .json(serviceResponse.content);
      } else {
        const serviceResponse = await dataService.instanceDataInit(
          dayBody,
          dayBody,
          yearBody,
          monthBody + 1,
          false
        );
        response
          .status(serviceResponse.statusCode)
          .json(serviceResponse.content);
      }
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportDetailPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;
      const reportId = Number(body.reportId);
      const dni = String(body.dni);

      const responseDetail = await reportService.findReportByWorker(
        reportId,
        dni
      );

      response.status(responseDetail.statusCode).json(responseDetail.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportDetailPut(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      const body = request.body;

      const serviceResponse = await reportService.updateHours(id, body);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportDetailDelete(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);

      const serviceResponse = await reportService.deleteIncident(id);

      response.status(serviceResponse.statusCode).json(serviceResponse.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportExportPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;

      const responseData = await reportService.dataForExportNormal(
        new Date(body.min),
        new Date(body.max)
      );

      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportExportStarsoftPost(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;
      const { month } = body;
      const year = new Date().getFullYear();

      const responseData = await reportService.dataForStartSoft(
        Number(month),
        year
      );
      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //new for use
  async newReportExportStarsoftPost(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;
      const { month } = body;
      const year = new Date().getFullYear();

      const responseData = await reportService.newDataForStartSoft(
        Number(month),
        year
      );
      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // v2

  async newReportForWorker(request: Request, response: Response) {
    try {
      const body = request.body;
      const { workerSelected, dateSelected } = body;

      const responseData = await reportService.newFormatForWorker(
        workerSelected,
        dateSelected
      );
      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  // v2

  async newModelReport(request: Request, response: Response) {
    try {
      const body = request.body;
      const { dateSelected } = body;

      const responseData = await reportService.newModelForReport(dateSelected);
      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportIncidentPost(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const body = request.body;

      const responseDetail = await reportService.addIncident(
        Number(body.detailReportId),
        Number(body.incidentId)
      );

      response.status(responseDetail.statusCode).json(responseDetail.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportIncidentIdGet(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);
      const responseDetail = await reportService.findIncidentsForDetail(id);

      response.status(responseDetail.statusCode).json(responseDetail.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportIncidentIdDelete(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const id = Number(request.params.id);
      const responseDetail = await reportService.deleteIncident(id);

      response.status(responseDetail.statusCode).json(responseDetail.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportUploadPost(request: any, response: Response): Promise<void> {
    try {
      // Usando multer para manejar la subida de archivos en memoria
      upload.single("file")(request, response, async (err) => {
        if (err) {
          return response.status(500).json({ error: "Error uploading file" });
        }

        const file = request.file;
        if (!file) {
          return response.status(400).json({ error: "No file uploaded" });
        }

        // const responseData = await reportService.uploadReportMassive(
        //   file.buffer
        // );

        const responseData = await reportService.uploadReportMassive(file);

        response.status(responseData.statusCode).json(responseData.content);
      });
    } catch (error) {
      response.status(500).json(error);
    }
  }

  //todo used
  async reportUploadUpdatePost(
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
        const responseData = await reportService.uploadUpdateReportMassive(
          file
        );

        response.status(responseData.statusCode).json(responseData.content);
      } catch (error) {
        response.status(500).json(error);
      }
    });
  }

  //todo used
  async reportWeeklyPost(request: Request, response: Response): Promise<void> {
    try {
      const body = request.body;

      const dayBody = Number(body.day);
      const monthBody = Number(body.month);
      const yearBody = Number(body.year);

      const allDays = await dataService.getDaysFromLastSaturdayToThisFriday(
        dayBody,
        monthBody,
        yearBody
      );

      const responseData = await reportService.generateReportForWeek(allDays);

      response.status(responseData.statusCode).json(responseData.content);
    } catch (error) {
      response.status(500).json(error);
    }
  }

  async reportGenerateDate(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const { daySelectedReport } = request.body;

      const dataSplit = daySelectedReport.split("-");

      const newFormat = daySelectedReport + "T05:00:00.000Z";

      const results = await prisma.detailReport.findMany({
        where: { fecha_reporte: new Date(newFormat) },
      });

      if (results.length > 0) {
        response.status(500).json({ message: "Ya hay registros de ese dia" });
      } else {
        await dataService.instanceDataInit(
          Number(dataSplit[2]),
          Number(dataSplit[2]),
          Number(dataSplit[0]),
          Number(dataSplit[1])
        );
        response.status(200).json({ message: "Report successfully" });
      }
      await prisma.$disconnect();
    } catch (error) {
      await prisma.$disconnect();
      response.status(500).json(error);
    }
  }
}

export const reportController = new ReportController();

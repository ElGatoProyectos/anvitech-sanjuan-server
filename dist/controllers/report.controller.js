"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const data_service_1 = require("../service/data.service");
const report_service_1 = require("../service/report.service");
const multer_1 = __importDefault(require("multer"));
const prisma_1 = __importDefault(require("../prisma"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
class ReportController {
    //todo used
    reportPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responseData = yield data_service_1.dataService.instanceDataInit();
                response.status(responseData.statusCode).json(responseData);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responseReports = yield report_service_1.reportService.findAll();
                response.status(responseReports.statusCode).json(responseReports.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportForWorkerDNIPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dni = request.params.dni;
                const data = request.body;
                const responseReports = yield report_service_1.reportService.generateReportForWorker(data, dni);
                response.status(responseReports.statusCode).json(responseReports.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const reportResponse = yield report_service_1.reportService.findById(id);
                response.status(reportResponse.statusCode).json(reportResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportDayGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const currentDay = currentDate.getDate();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                const serviceResponse = yield data_service_1.dataService.instanceDataInit(currentDay, currentDay, currentYear, currentMonth, false);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportDayPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const dayBody = Number(body.day);
                const monthBody = Number(body.month) - 1;
                const yearBody = Number(body.year);
                const dateBody = new Date(yearBody, monthBody, dayBody);
                const currentDate = new Date();
                const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                if (dateBody < currentDateOnly) {
                    const serviceResponse = yield report_service_1.reportService.generateReportForDayNoToday(dayBody, monthBody + 1, yearBody);
                    response
                        .status(serviceResponse.statusCode)
                        .json(serviceResponse.content);
                }
                else {
                    const serviceResponse = yield data_service_1.dataService.instanceDataInit(dayBody, dayBody, yearBody, monthBody + 1, false);
                    response
                        .status(serviceResponse.statusCode)
                        .json(serviceResponse.content);
                }
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportDetailPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const reportId = Number(body.reportId);
                const dni = String(body.dni);
                const responseDetail = yield report_service_1.reportService.findReportByWorker(reportId, dni);
                response.status(responseDetail.statusCode).json(responseDetail.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportDetailPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const body = request.body;
                const serviceResponse = yield report_service_1.reportService.updateHours(id, body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportDetailDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield report_service_1.reportService.deleteIncident(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportExportPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const responseData = yield report_service_1.reportService.dataForExportNormal(new Date(body.min), new Date(body.max));
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportExportStarsoftPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const { month } = body;
                const year = new Date().getFullYear();
                const responseData = yield report_service_1.reportService.dataForStartSoft(Number(month), year);
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //new for use
    newReportExportStarsoftPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const { month } = body;
                const year = new Date().getFullYear();
                const responseData = yield report_service_1.reportService.newDataForStartSoft(Number(month), year);
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // v2
    newReportForWorker(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const { workerSelected, dateSelected } = body;
                const responseData = yield report_service_1.reportService.newFormatForWorker(workerSelected, dateSelected);
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // v2
    newModelReport(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const { dateSelected } = body;
                const responseData = yield report_service_1.reportService.newModelForReport(dateSelected);
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportIncidentPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const responseDetail = yield report_service_1.reportService.addIncident(Number(body.detailReportId), Number(body.incidentId));
                response.status(responseDetail.statusCode).json(responseDetail.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportIncidentIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const responseDetail = yield report_service_1.reportService.findIncidentsForDetail(id);
                response.status(responseDetail.statusCode).json(responseDetail.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportIncidentIdDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const responseDetail = yield report_service_1.reportService.deleteIncident(id);
                response.status(responseDetail.statusCode).json(responseDetail.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportUploadPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Usando multer para manejar la subida de archivos en memoria
                upload.single("file")(request, response, (err) => __awaiter(this, void 0, void 0, function* () {
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
                    const responseData = yield report_service_1.reportService.uploadReportMassive(file);
                    response.status(responseData.statusCode).json(responseData.content);
                }));
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    //todo used
    reportUploadUpdatePost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            upload.single("file")(request, response, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return response.status(500).json({ error: "Error uploading file" });
                }
                const file = request.file;
                if (!file) {
                    return response.status(400).json({ error: "No file uploaded" });
                }
                try {
                    const responseData = yield report_service_1.reportService.uploadUpdateReportMassive(file);
                    response.status(responseData.statusCode).json(responseData.content);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    //todo used
    reportWeeklyPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const dayBody = Number(body.day);
                const monthBody = Number(body.month);
                const yearBody = Number(body.year);
                const allDays = yield data_service_1.dataService.getDaysFromLastSaturdayToThisFriday(dayBody, monthBody, yearBody);
                const responseData = yield report_service_1.reportService.generateReportForWeek(allDays);
                response.status(responseData.statusCode).json(responseData.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    reportGenerateDate(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daySelectedReport } = request.body;
                const dataSplit = daySelectedReport.split("-");
                const newFormat = daySelectedReport + "T05:00:00.000Z";
                const results = yield prisma_1.default.detailReport.findMany({
                    where: { fecha_reporte: new Date(newFormat) },
                });
                if (results.length > 0) {
                    response.status(500).json({ message: "Ya hay registros de ese dia" });
                }
                else {
                    yield data_service_1.dataService.instanceDataInit(Number(dataSplit[2]), Number(dataSplit[2]), Number(dataSplit[0]), Number(dataSplit[1]));
                    response.status(200).json({ message: "Report successfully" });
                }
                yield prisma_1.default.$disconnect();
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                response.status(500).json(error);
            }
        });
    }
}
exports.reportController = new ReportController();

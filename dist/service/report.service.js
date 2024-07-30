"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.reportService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const xlsx = __importStar(require("xlsx"));
const worker_service_1 = require("./worker.service");
const schedule_service_1 = require("./schedule.service");
const prisma_1 = __importDefault(require("../prisma"));
class ReportService {
    generateReport() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lastReport = (yield this.findLast());
                let numberPos;
                if (lastReport !== null) {
                    const nameSepare = lastReport.name.split(" ");
                    numberPos = Number(nameSepare[1]) + 1;
                }
                else
                    numberPos = 1;
                const dataSet = {
                    state: "default",
                    name: "Report " + numberPos,
                };
                const report = yield prisma_1.default.report.create({ data: dataSet });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report created ok", report);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    generateReportDetail(dataGeneralAniz, reportId) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo mapeo de la informacion y registro de la misma en base al id del reporte
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reports = yield prisma_1.default.report.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All reports", reports);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    generateReportForWorker(data, dni) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const worker = yield prisma_1.default.worker.findFirst({ where: { dni } });
                if (!worker)
                    return response_service_1.httpResponse.http404("worker not found");
                const { start, end } = data;
                const start_date_prev = new Date(start);
                start_date_prev.setDate(start_date_prev.getDate());
                const end_date_prev = new Date(end);
                end_date_prev.setDate(end_date_prev.getDate() + 1);
                // Buscar registros en el rango de fechas
                const report = yield prisma_1.default.detailReport.findMany({
                    where: {
                        dni,
                        fecha_reporte: {
                            gte: start_date_prev,
                            lte: end_date_prev,
                        },
                    },
                });
                return response_service_1.httpResponse.http200("Report", { report, worker });
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findById(reportId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const detail = yield prisma_1.default.report.findFirst({ where: { id: reportId } });
                if (!detail)
                    return response_service_1.httpResponse.http404("Report not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report found", detail);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findLast() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield prisma_1.default.report.findFirst({
                orderBy: {
                    id: "desc",
                },
            });
            yield prisma_1.default.$disconnect();
            return data;
        });
    }
    /// not used
    findDetailReport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield prisma_1.default.detailReport.findMany({
                    where: { report_id: id },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All details report", details);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findReportByWorker(reportId, workerDNI) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const detail = yield prisma_1.default.detailReport.findMany({
                    where: { report_id: reportId, dni: workerDNI },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All details report", detail);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    /// ok
    updateHours(detailReportId, dataHours) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield prisma_1.default.detailReport.update({
                    where: { id: detailReportId },
                    data: {
                        hora_inicio: { set: dataHours.hora_inicio },
                        hora_inicio_refrigerio: { set: dataHours.hora_inicio_refrigerio },
                        hora_fin_refrigerio: { set: dataHours.hora_fin_refrigerio },
                        hora_salida: { set: dataHours.hora_salida },
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Detail updated", updated);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    addIncident(detailReportId, incidentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // modifica la tardanza y falta porque esta justificado
                yield prisma_1.default.detailReport.update({
                    where: { id: detailReportId },
                    data: { tardanza: "no", falta: "no" },
                });
                yield prisma_1.default.$disconnect();
                const updated = yield prisma_1.default.detailReportIncident.create({
                    data: {
                        detail_report_id: detailReportId,
                        incident_id: incidentId,
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Incident created", updated);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    deleteIncident(detailId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // tenemos que validar si el trabajador tiene tardanza o falta
                const reporseDetail = yield prisma_1.default.detailReportIncident.findFirst({
                    where: { id: detailId },
                });
                yield prisma_1.default.$disconnect();
                yield prisma_1.default.detailReport.update({
                    where: { id: reporseDetail === null || reporseDetail === void 0 ? void 0 : reporseDetail.detail_report_id },
                    data: { falta: "si" },
                });
                yield prisma_1.default.$disconnect();
                const deleted = yield prisma_1.default.detailReportIncident.delete({
                    where: { id: detailId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Incident detail deleted", deleted);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findIncidentsForDetail(detailId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incidents = yield prisma_1.default.detailReportIncident.findMany({
                    where: { detail_report_id: detailId },
                    include: {
                        incident: true,
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All incidents for detail", incidents);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    //ok
    getMondayAndSaturdayDates() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startDate = new Date(now);
        const endDate = new Date(now);
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        startDate.setDate(startDate.getDate() + diffToMonday);
        const diffToSaturday = 6 - dayOfWeek;
        endDate.setDate(endDate.getDate() + diffToSaturday);
        return {
            monday: startDate,
            saturday: endDate,
        };
    }
    getMondayAndSaturdayDatesWParmas(dateString) {
        const [year, month, day] = dateString.split("-").map(Number); // YYYY-MM-DD format
        const inputDate = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid timezone issues
        const dayOfWeek = inputDate.getUTCDay(); // Use getUTCDay() for consistency
        const startDate = new Date(inputDate);
        const endDate = new Date(inputDate);
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        startDate.setUTCDate(startDate.getUTCDate() + diffToMonday); // Use setUTCDate
        const diffToSaturday = 6 - dayOfWeek;
        endDate.setUTCDate(endDate.getUTCDate() + diffToSaturday); // Use setUTCDate
        return {
            startDate,
            endDate,
        };
    }
    //ok
    dataForStartSoft(month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 1);
                const detailReports = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            gte: startDate,
                            lt: endDate,
                        },
                    },
                });
                yield prisma_1.default.$disconnect();
                const responseWorkers = yield worker_service_1.workerService.findAll();
                yield prisma_1.default.$disconnect();
                const dataGeneral = yield Promise.all(yield responseWorkers.content.map((worker) => __awaiter(this, void 0, void 0, function* () {
                    const responseVacations = yield prisma_1.default.vacation.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responsePermission = yield prisma_1.default.permissions.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseMedicalRest = yield prisma_1.default.medicalRest.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseLicenses = yield prisma_1.default.licence.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseReports = yield prisma_1.default.detailReport.findMany({
                        where: {
                            dni: worker.dni,
                            AND: [
                                {
                                    fecha_reporte: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    fecha_reporte: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const formatData = {
                        worker,
                        reportes: responseReports,
                        vacaciones: responseVacations,
                        descansos_medico: responseMedicalRest,
                        licencias: responseLicenses,
                        permisos: responsePermission,
                    };
                    return formatData;
                })));
                const incidents = yield prisma_1.default.incident.findMany({
                    where: { date: { gte: startDate, lt: endDate } },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report success", dataGeneral);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // v2
    newDataForStartSoft(month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 1);
                const responseWorkers = yield worker_service_1.workerService.findAll();
                yield prisma_1.default.$disconnect();
                const dataGeneral = yield Promise.all(yield responseWorkers.content.map((worker) => __awaiter(this, void 0, void 0, function* () {
                    const schedule = yield prisma_1.default.schedule.findFirst({
                        where: { worker_id: worker.id },
                    });
                    const responseVacations = yield prisma_1.default.vacation.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responsePermission = yield prisma_1.default.permissions.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseMedicalRest = yield prisma_1.default.medicalRest.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseLicenses = yield prisma_1.default.licence.findMany({
                        where: {
                            worker_id: worker.id,
                            AND: [
                                {
                                    start_date: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    end_date: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const responseReports = yield prisma_1.default.detailReport.findMany({
                        where: {
                            dni: worker.dni,
                            AND: [
                                {
                                    fecha_reporte: {
                                        lte: endDate,
                                    },
                                },
                                {
                                    fecha_reporte: {
                                        gte: startDate,
                                    },
                                },
                            ],
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const formatData = {
                        worker,
                        schedule,
                        reportes: responseReports,
                        vacaciones: responseVacations,
                        descansos_medico: responseMedicalRest,
                        licencias: responseLicenses,
                        permisos: responsePermission,
                    };
                    return formatData;
                })));
                const incidents = yield prisma_1.default.incident.findMany({
                    where: { date: { gte: startDate, lt: endDate } },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report success", { dataGeneral, incidents });
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // v2
    newFormatForWorker(workerSelected, dateSelected) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { start, end } = dateSelected;
                const startDate = new Date(`${start}T00:00:00`);
                const endDate = new Date(`${end}T23:59:59`);
                const reports = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            gte: startDate,
                            lt: endDate,
                        },
                        dni: workerSelected.dni,
                    },
                });
                const schedule = yield prisma_1.default.schedule.findFirst({
                    where: { worker_id: workerSelected.id },
                });
                const responseVacations = yield prisma_1.default.vacation.findMany({
                    where: {
                        worker_id: workerSelected.id,
                        AND: [
                            {
                                start_date: {
                                    lte: endDate,
                                },
                            },
                            {
                                end_date: {
                                    gte: startDate,
                                },
                            },
                        ],
                    },
                });
                yield prisma_1.default.$disconnect();
                const responsePermission = yield prisma_1.default.permissions.findMany({
                    where: {
                        worker_id: workerSelected.id,
                        AND: [
                            {
                                start_date: {
                                    lte: endDate,
                                },
                            },
                            {
                                end_date: {
                                    gte: startDate,
                                },
                            },
                        ],
                    },
                });
                yield prisma_1.default.$disconnect();
                const responseMedicalRest = yield prisma_1.default.medicalRest.findMany({
                    where: {
                        worker_id: workerSelected.id,
                        AND: [
                            {
                                start_date: {
                                    lte: endDate,
                                },
                            },
                            {
                                end_date: {
                                    gte: startDate,
                                },
                            },
                        ],
                    },
                });
                yield prisma_1.default.$disconnect();
                const responseLicenses = yield prisma_1.default.licence.findMany({
                    where: {
                        worker_id: workerSelected.id,
                        AND: [
                            {
                                start_date: {
                                    lte: endDate,
                                },
                            },
                            {
                                end_date: {
                                    gte: startDate,
                                },
                            },
                        ],
                    },
                });
                yield prisma_1.default.$disconnect();
                const formatData = {
                    reportes: reports,
                    vacaciones: responseVacations,
                    descansos_medico: responseMedicalRest,
                    licencias: responseLicenses,
                    permisos: responsePermission,
                    schedule,
                };
                return response_service_1.httpResponse.http200("Report success", formatData);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // new
    newModelForReport(dateSelected) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log(dateSelected);
                const { startDate, endDate } = this.getMondayAndSaturdayDatesWParmas(dateSelected);
                const reports = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            gte: startDate,
                            lt: endDate,
                        },
                    },
                });
                const data = yield Promise.all(reports.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const dni = item.dni;
                    const worker = yield worker_service_1.workerService.findByDNI(dni);
                    return {
                        report: item,
                        worker,
                    };
                })));
                return response_service_1.httpResponse.http200("Report success", data);
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // ok
    dataForExportNormal(dateMin, dateMax) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            gte: dateMin,
                            lte: dateMax,
                        },
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All data", data);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // busca todos los reportes no importa si el trabajador ya este inactivo o activo
    generateReportForDayNoToday(day, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
                // End date at the beginning of the next day
                const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
                const data = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            gte: startDate,
                            lt: endDate,
                        },
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report day created", data);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    generateReportForWeek(days) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { content: workers } = yield worker_service_1.workerService.findAll();
                yield prisma_1.default.$disconnect();
                // Obtener todos los reportes de una sola vez
                const reports = yield prisma_1.default.detailReport.findMany({
                    where: {
                        fecha_reporte: {
                            in: days,
                        },
                        dni: {
                            in: workers.map((worker) => worker.dni),
                        },
                    },
                });
                yield prisma_1.default.$disconnect();
                const response = workers.map((worker) => {
                    const formatData = {
                        worker,
                        lunes: null,
                        martes: null,
                        miercoles: null,
                        jueves: null,
                        viernes: null,
                        sabado: null,
                        domingo: null,
                    };
                    // Filtrar y asignar los reportes correspondientes a cada día
                    for (let i = 0; i < days.length; i++) {
                        const day = days[i];
                        const data = reports.find((report) => new Date(report.fecha_reporte).toISOString() === day &&
                            report.dni === worker.dni);
                        if (i === 0)
                            formatData.sabado = data || null;
                        else if (i === 1)
                            formatData.domingo = data || null;
                        else if (i === 2)
                            formatData.lunes = data || null;
                        else if (i === 3)
                            formatData.martes = data || null;
                        else if (i === 4)
                            formatData.miercoles = data || null;
                        else if (i === 5)
                            formatData.jueves = data || null;
                        else if (i === 6)
                            formatData.viernes = data || null;
                    }
                    return formatData;
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report weekly", response);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // async generateReportForWeek(days: string[]) {
    //   try {
    //     const { content: workers } = await workerService.findAll();
    //     await prisma.$disconnect();
    //     const response = await Promise.all(
    //       workers.map(async (worker: any) => {
    //         const formatData = {
    //           worker,
    //           lunes: {},
    //           martes: {},
    //           miercoles: {},
    //           jueves: {},
    //           viernes: {},
    //           sabado: {},
    //           domingo: {},
    //         };
    //         for (let i = 0; i < days.length; i++) {
    //           const day = days[i];
    //           const data: any = await prisma.detailReport.findFirst({
    //             where: { fecha_reporte: day, dni: worker.dni },
    //           });
    //           await prisma.$disconnect();
    //           if (i === 0) formatData.sabado = data ? data : null;
    //           else if (i === 1) formatData.domingo = data ? data : null;
    //           else if (i === 2) formatData.lunes = data ? data : null;
    //           else if (i === 3) formatData.martes = data ? data : null;
    //           else if (i === 4) formatData.miercoles = data ? data : null;
    //           else if (i === 5) formatData.jueves = data ? data : null;
    //           else if (i === 6) formatData.viernes = data ? data : null;
    //         }
    //         return formatData;
    //       })
    //     );
    //     await prisma.$disconnect();
    //     return httpResponse.http200("Report weekly", response);
    //   } catch (error) {
    //     await prisma.$disconnect();
    //     return errorService.handleErrorSchema(error);
    //   }
    // }
    updateDetailReport(data, detailReportId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // capturamos el horario del trabajador
                const { dataTemporalHours, dataDetail } = data;
                const workerResponse = yield worker_service_1.workerService.findByDNI(dataDetail.dni);
                if (!workerResponse.ok)
                    return workerResponse;
                const schedule = yield prisma_1.default.schedule.findFirst({
                    where: { worker_id: workerResponse.content.id },
                });
                yield prisma_1.default.$disconnect();
                if (!schedule)
                    return response_service_1.httpResponse.http400("Schedule not found");
                // ahora validamos ==========================================================================
                const hourTotal = schedule.lunes; // "09:00-18:00"
                const [hourStart, hourEnd] = hourTotal.split("-"); // ["09:00", "18:00"]
                const [scheduleStartHour, scheduStartMinute] = hourStart
                    .split(":")
                    .map(Number); // [9, 0]
                const [scheduleEndHour, scheduEndMinute] = hourEnd.split(":").map(Number); // [18, 0]
                const dataStart = dataTemporalHours.hora_inicio; // "09:00"
                const dataEnd = dataTemporalHours.hora_salida; // "18:00"
                const formatData = {
                    hora_inicio: dataTemporalHours.hora_inicio,
                    hora_inicio_refrigerio: dataTemporalHours.hora_inicio_refrigerio,
                    hora_fin_refrigerio: dataTemporalHours.hora_fin_refrigerio,
                    hora_salida: dataTemporalHours.hora_salida,
                    tardanza: "no",
                    falta: "no",
                    discount: 0,
                };
                // cuando el usuario tiene una hora de entrada
                if (dataTemporalHours.hora_inicio !== "" &&
                    dataTemporalHours.hora_salida === "") {
                    const [dataStartHour, dataStartMinute] = dataTemporalHours.hora_inicio
                        .split(":")
                        .map(Number);
                    // aqui cambie la falta por tardanza
                    if (dataStartHour <= 11) {
                        if (dataStartHour > scheduleStartHour) {
                            formatData.tardanza = "si";
                            formatData.discount = 35;
                        }
                        else {
                            if (dataStartHour === scheduleStartHour) {
                                if (Number(dataStartMinute) <= 5) {
                                    formatData.tardanza = "no";
                                }
                                else if (Number(dataStartMinute) > 5 &&
                                    Number(dataStartMinute) <= 15) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 5;
                                }
                                else if (Number(dataStartMinute) > 15 &&
                                    Number(dataStartMinute) <= 30) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 10;
                                }
                                else if (Number(dataStartMinute) > 30 &&
                                    Number(dataStartMinute) <= 59) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 20;
                                }
                            }
                            else {
                                formatData.tardanza = "no";
                            }
                        }
                        formatData.falta = "no";
                    }
                    formatData.falta = "si";
                    formatData.discount = 35;
                }
                // cuando el usuario tiene una hora de salida
                else if (dataTemporalHours.hora_inicio === "" &&
                    dataTemporalHours.hora_salida !== "") {
                    const [dataEndHour, dataEndMinute] = dataTemporalHours.hora_salida
                        .split(":")
                        .map(Number);
                    if (dataEndHour < scheduleEndHour) {
                        formatData.falta = "si";
                        formatData.tardanza = "no";
                    }
                    else if (dataEndHour === scheduleEndHour) {
                        if (dataTemporalHours.hora_inicio === "") {
                            formatData.tardanza = "si";
                            formatData.discount = 35;
                        }
                        formatData.falta = "no";
                    }
                }
                else if (dataStart === "" && dataEnd === "") {
                    formatData.falta = "si";
                    formatData.tardanza = "no";
                    formatData.discount = 35;
                }
                else {
                    // ====================caso donde tienen hora_inicio y hora_fin ============================
                    const [dataStartHour, dataStartMinute] = dataTemporalHours.hora_inicio
                        .split(":")
                        .map(Number);
                    const [dataEndHour, dataEndMinute] = dataTemporalHours.hora_salida
                        .split(":")
                        .map(Number);
                    if (dataStartHour <= 11) {
                        if (dataStartHour > scheduleStartHour) {
                            formatData.tardanza = "si";
                            formatData.discount = 35;
                        }
                        else {
                            if (dataStartHour === scheduleStartHour) {
                                if (Number(dataStartMinute) <= 5) {
                                    formatData.tardanza = "no";
                                }
                                else if (Number(dataStartMinute) > 5 &&
                                    Number(dataStartMinute) <= 15) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 5;
                                }
                                else if (Number(dataStartMinute) > 15 &&
                                    Number(dataStartMinute) <= 30) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 10;
                                }
                                else if (Number(dataStartMinute) > 30 &&
                                    Number(dataStartMinute) <= 59) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 20;
                                }
                            }
                            else {
                                formatData.tardanza = "no";
                            }
                        }
                        formatData.falta = "no";
                    }
                    else {
                        formatData.tardanza = "si";
                    }
                    if (dataEndHour < scheduleEndHour) {
                        formatData.falta = "si";
                        formatData.tardanza = "no";
                    }
                    else if (dataEndHour === scheduleEndHour) {
                        formatData.falta = "no";
                    }
                }
                // if (
                //   dataTemporalHours.hora_inicio_refrigerio === "" ||
                //   dataTemporalHours.hora_fin_refrigerio === ""
                // ) {
                //   formatData.falta = "si";
                //   formatData.discount = 35;
                // }
                const updated = yield prisma_1.default.detailReport.update({
                    where: { id: detailReportId },
                    data: formatData,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Detail report updated", updated);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    uploadReportMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                const exampleData = sheetToJson[0];
                const report = yield exports.reportService.generateReport();
                yield Promise.all(sheetToJson.map((row, index) => __awaiter(this, void 0, void 0, function* () {
                    const worker = yield worker_service_1.workerService.findByDNI(String(row.dni));
                    const schedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.content.id);
                    const [scheduleStart, scheduleEnd] = schedule.content[this.getDayOfWeek(new Date(row.fecha_reporte))].split("-");
                    const [scheduleHourStart, scheduleMinuteStart] = scheduleStart
                        .split(":")
                        .map(Number);
                    const [scheduleHourEnd, scheduleMinuteEnd] = scheduleEnd
                        .split(":")
                        .map(Number);
                    const formatData = {
                        report_id: report.content.id,
                        tardanza: "no",
                        falta: "si",
                        fecha_reporte: this.excelSerialDateToJSDate(row.fecha_reporte),
                        dia: this.getDayOfWeek(this.excelSerialDateToJSDate(row.fecha_reporte)),
                        dni: String(row.dni),
                        nombre: worker.content.full_name,
                        sede: worker.content.department,
                        hora_inicio: row.hora_inicio ? String(row.hora_inicio) : "",
                        hora_inicio_refrigerio: row.hora_inicio_refrigerio
                            ? String(row.hora_inicio_refrigerio)
                            : "",
                        hora_fin_refrigerio: row.hora_fin_refrigerio
                            ? String(row.hora_fin_refrigerio)
                            : "",
                        hora_salida: row.hora_salida ? String(row.hora_salida) : "",
                        discount: 0,
                    };
                    // cuando el usuario tiene registrado una hora de inicio ===============
                    if (row.hora_inicio !== "" && row.hora_salida === "") {
                        const [dataStartHour, dataStartMinute] = row.hora_inicio
                            .split(":")
                            .map(Number);
                        if (dataStartHour <= 11) {
                            if (dataStartHour > scheduleHourStart) {
                                formatData.tardanza = "si";
                                formatData.discount = 35;
                            }
                            else {
                                if (dataStartHour === scheduleHourStart) {
                                    if (Number(dataStartMinute) <= 5) {
                                        formatData.tardanza = "no";
                                    }
                                    else if (Number(dataStartMinute) > 5 &&
                                        Number(dataStartMinute) <= 15) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 5;
                                    }
                                    else if (Number(dataStartMinute) > 15 &&
                                        Number(dataStartMinute) <= 30) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 10;
                                    }
                                    else if (Number(dataStartMinute) > 30 &&
                                        Number(dataStartMinute) <= 59) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 20;
                                    }
                                }
                                else {
                                    formatData.tardanza = "no";
                                }
                            }
                            formatData.falta = "no";
                        }
                        formatData.falta = "si";
                        formatData.discount = 35;
                    }
                    // cuando el usuario tiene una hora de salida
                    else if (row.hora_inicio === "" && row.hora_salida !== "") {
                        const [dataEndHour, dataEndMinute] = row.hora_salida
                            .split(":")
                            .map(Number);
                        if (dataEndHour < scheduleHourEnd) {
                            formatData.falta = "si";
                            formatData.tardanza = "no";
                        }
                        else if (dataEndHour === scheduleHourEnd) {
                            if (row.hora_inicio === "")
                                formatData.tardanza = "si";
                            formatData.falta = "no";
                        }
                    }
                    else if (row.hora_inicio === "" && row.hora_salida === "") {
                        formatData.falta = "si";
                        formatData.tardanza = "no";
                    }
                    else {
                        const [dataStartHour, dataStartMinute] = String(row.hora_inicio)
                            .split(":")
                            .map(Number);
                        const [dataEndHour, dataEndMinute] = String(row.hora_salida)
                            .split(":")
                            .map(Number);
                        if (dataStartHour <= 11) {
                            if (dataStartHour > scheduleHourStart) {
                                formatData.tardanza = "si";
                                formatData.discount = 35;
                            }
                            else {
                                if (dataStartHour === scheduleHourStart) {
                                    if (Number(dataStartMinute) <= 5) {
                                        formatData.tardanza = "no";
                                    }
                                    else if (Number(dataStartMinute) > 5 &&
                                        Number(dataStartMinute) <= 15) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 5;
                                    }
                                    else if (Number(dataStartMinute) > 15 &&
                                        Number(dataStartMinute) <= 30) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 10;
                                    }
                                    else if (Number(dataStartMinute) > 30 &&
                                        Number(dataStartMinute) <= 59) {
                                        formatData.tardanza = "si";
                                        formatData.discount = 20;
                                    }
                                }
                                else {
                                    formatData.tardanza = "no";
                                }
                            }
                            formatData.falta = "no";
                        }
                        else {
                            formatData.tardanza = "si";
                        }
                    }
                    // if (
                    //   row.hora_inicio_refrigerio === "" ||
                    //   row.hora_fin_refrigerio === ""
                    // ) {
                    //   formatData.falta = "si";
                    //   formatData.discount = 35;
                    // }
                    //- validamos si esta en un fecha donde tiene una escusa para no asistir
                    const responseValidateWorkerInDay = yield this.validateDayInWorker(new Date(row.fecha_reporte), worker.content.id);
                    if (responseValidateWorkerInDay) {
                        formatData.falta = "no";
                        formatData.tardanza = "no";
                        formatData.discount = 0;
                    }
                    yield prisma_1.default.detailReport.create({ data: formatData });
                    yield prisma_1.default.$disconnect();
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Ok", "Reports upload");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    uploadUpdateReportMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((row, index) => __awaiter(this, void 0, void 0, function* () {
                    const worker = yield worker_service_1.workerService.findByDNI(String(row.dni));
                    const schedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.content.id);
                    const detail = yield prisma_1.default.detailReport.findFirst({
                        where: {
                            dni: String(row.dni),
                            dia: this.getDayOfWeek(this.excelSerialDateToJSDate(row.fecha_reporte)),
                        },
                    });
                    yield prisma_1.default.$disconnect();
                    const [scheduleStart, scheduleEnd] = schedule.content[this.getDayOfWeek(new Date(row.fecha_reporte))].split("-");
                    const [scheduleHourStart, scheduleMinuteStart] = scheduleStart
                        .split(":")
                        .map(Number);
                    const [scheduleHourEnd, scheduleMinuteEnd] = scheduleEnd
                        .split(":")
                        .map(Number);
                    const formatData = {
                        report_id: detail === null || detail === void 0 ? void 0 : detail.report_id,
                        tardanza: "no",
                        falta: "si",
                        fecha_reporte: this.excelSerialDateToJSDate(row.fecha_reporte),
                        dia: this.getDayOfWeek(this.excelSerialDateToJSDate(row.fecha_reporte)),
                        dni: String(row.dni),
                        nombre: worker.content.full_name,
                        sede: worker.content.department,
                        hora_inicio: row.hora_inicio ? String(row.hora_inicio) : "",
                        hora_inicio_refrigerio: row.hora_inicio_refrigerio
                            ? String(row.hora_inicio_refrigerio)
                            : "",
                        hora_fin_refrigerio: row.hora_fin_refrigerio
                            ? String(row.hora_fin_refrigerio)
                            : "",
                        hora_salida: row.hora_salida ? String(row.hora_salida) : "",
                        discount: 0,
                    };
                    // si hay un registro empezamos a condicionar los horarios =============================================
                    if (detail) {
                        if (row.hora_inicio !== "" && row.hora_salida === "") {
                            const [dataStartHour, dataStartMinute] = row.hora_inicio
                                .split(":")
                                .map(Number);
                            if (dataStartHour <= 11) {
                                if (dataStartHour > scheduleHourStart) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (dataStartHour === scheduleHourStart) {
                                        if (Number(dataStartMinute) <= 5) {
                                            formatData.tardanza = "no";
                                        }
                                        else if (Number(dataStartMinute) > 5 &&
                                            Number(dataStartMinute) <= 15) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                        else if (Number(dataStartMinute) > 15 &&
                                            Number(dataStartMinute) <= 30) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 10;
                                        }
                                        else if (Number(dataStartMinute) > 30 &&
                                            Number(dataStartMinute) <= 59) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 20;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                    }
                                }
                                formatData.falta = "no";
                            }
                            formatData.falta = "si";
                            formatData.discount = 35;
                        }
                        // cuando el usuario tiene una hora de salida
                        else if (row.hora_inicio === "" && row.hora_salida !== "") {
                            const [dataEndHour, dataEndMinute] = row.hora_salida
                                .split(":")
                                .map(Number);
                            if (dataEndHour < scheduleHourEnd) {
                                formatData.falta = "si";
                                formatData.tardanza = "no";
                            }
                            else if (dataEndHour === scheduleHourEnd) {
                                if (row.hora_inicio === "")
                                    formatData.tardanza = "si";
                                formatData.falta = "no";
                            }
                        }
                        else if (row.hora_inicio === "" && row.hora_salida === "") {
                            formatData.falta = "si";
                            formatData.tardanza = "no";
                        }
                        else {
                            const [dataStartHour, dataStartMinute] = String(row.hora_inicio)
                                .split(":")
                                .map(Number);
                            const [dataEndHour, dataEndMinute] = String(row.hora_salida)
                                .split(":")
                                .map(Number);
                            if (dataStartHour <= 11) {
                                if (dataStartHour > scheduleHourStart) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (dataStartHour === scheduleHourStart) {
                                        if (Number(dataStartMinute) <= 5) {
                                            formatData.tardanza = "no";
                                        }
                                        else if (Number(dataStartMinute) > 5 &&
                                            Number(dataStartMinute) <= 15) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                        else if (Number(dataStartMinute) > 15 &&
                                            Number(dataStartMinute) <= 30) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 10;
                                        }
                                        else if (Number(dataStartMinute) > 30 &&
                                            Number(dataStartMinute) <= 59) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 20;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                    }
                                }
                                formatData.falta = "no";
                            }
                            else {
                                formatData.tardanza = "si";
                            }
                        }
                        // if (
                        //   row.hora_inicio_refrigerio === "" ||
                        //   row.hora_fin_refrigerio === ""
                        // ) {
                        //   formatData.falta = "si";
                        //   formatData.discount = 35;
                        // }
                        //- validamos si esta en un fecha donde tiene una escusa para no asistir
                        const responseValidateWorkerInDay = yield this.validateDayInWorker(new Date(row.fecha_reporte), worker.content.id);
                        if (responseValidateWorkerInDay) {
                            formatData.falta = "no";
                            formatData.tardanza = "no";
                            formatData.discount = 0;
                        }
                        const created = yield prisma_1.default.detailReport.update({
                            where: { id: detail.id },
                            data: formatData,
                        });
                    }
                    // si hay un registro empezamos a condicionar los horarios =============================================
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Ok", "Reports upload");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    excelSerialDateToJSDate(serial) {
        const excelEpoch = new Date("1899-12-30"); // Fecha base de Excel
        const millisecondsInDay = 24 * 60 * 60 * 1000; // Milisegundos en un día
        const offsetDays = Math.floor(serial); // Parte entera del número de serie
        // Calcular el número de milisegundos desde la fecha base
        const dateMilliseconds = excelEpoch.getTime() + offsetDays * millisecondsInDay;
        // Crear y devolver el objeto Date
        const date = new Date(dateMilliseconds);
        return date;
    }
    getDayOfWeek(date) {
        const daysOfWeek = [
            "domingo",
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
        ];
        const dayIndex = date.getDay() + 1;
        return daysOfWeek[dayIndex];
    }
    validateDayInWorker(fecha_excel, workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // tenemos que transformar la fecha como en el data service
            // esto pendiente hasta que se presente el bug
            // const dateYesterday = new Date(fecha_excel);
            // dateYesterday.setDate(dateYesterday.getDate() - 1);
            // const datePost = new Date();
            // datePost.setDate(datePost.getDate());
            // dateYesterday.setHours(0, 0, 0, 0);
            // datePost.setHours(0, 0, 0, 0);
            // fecha_excel.setHours(0, 0, 0, 0);
            const incidentResponse = yield prisma_1.default.incident.findMany({
                where: {
                    date: fecha_excel,
                },
            });
            yield prisma_1.default.$disconnect();
            const medicalRestResponse = yield prisma_1.default.medicalRest.findMany({
                where: {
                    worker_id: workerId,
                    AND: [
                        {
                            start_date: {
                                lte: fecha_excel,
                            },
                        },
                        {
                            end_date: {
                                gte: fecha_excel,
                            },
                        },
                    ],
                },
            });
            yield prisma_1.default.$disconnect();
            const vacationResponse = yield prisma_1.default.vacation.findMany({
                where: {
                    worker_id: workerId,
                    AND: [
                        {
                            start_date: {
                                lte: fecha_excel,
                            },
                        },
                        {
                            end_date: {
                                gte: fecha_excel,
                            },
                        },
                    ],
                },
            });
            yield prisma_1.default.$disconnect();
            // validamos los permisos
            const permissionResponse = yield prisma_1.default.permissions.findMany({
                where: {
                    worker_id: workerId,
                    AND: [
                        {
                            start_date: {
                                lte: fecha_excel,
                            },
                        },
                        {
                            end_date: {
                                gte: fecha_excel,
                            },
                        },
                    ],
                },
            });
            yield prisma_1.default.$disconnect();
            const licencesResponse = yield prisma_1.default.licence.findMany({
                where: {
                    worker_id: workerId,
                    AND: [
                        {
                            start_date: {
                                lte: fecha_excel,
                            },
                        },
                        {
                            end_date: {
                                gte: fecha_excel,
                            },
                        },
                    ],
                },
            });
            yield prisma_1.default.$disconnect();
            if (vacationResponse.length > 0 ||
                permissionResponse.length > 0 ||
                licencesResponse.length > 0 ||
                medicalRestResponse.length > 0 ||
                incidentResponse.length > 0)
                return true;
            return false;
        });
    }
}
exports.reportService = new ReportService();

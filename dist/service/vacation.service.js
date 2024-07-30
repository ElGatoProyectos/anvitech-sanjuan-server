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
exports.vacationService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const xlsx = __importStar(require("xlsx"));
const report_service_1 = require("./report.service");
const prisma_1 = __importDefault(require("../prisma"));
class VacationService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) { }
        });
    }
    findLasts(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacations = yield prisma_1.default.vacation.findMany({
                    where: { worker_id: workerId },
                    orderBy: {
                        id: "desc",
                    },
                    take: 5,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Vacations", vacations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findByWorker(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacations = yield prisma_1.default.vacation.findMany({
                    where: { worker_id: workerId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All vacations", vacations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formatData = Object.assign(Object.assign({}, data), { start_date: new Date(data.start_date), end_date: new Date(data.end_date) });
                const vacations = yield prisma_1.default.vacation.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All vacations", vacations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    edit(data, vacationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacation = yield prisma_1.default.vacation.findFirst({
                    where: { id: vacationId },
                });
                if (!vacation)
                    return response_service_1.httpResponse.http400("Error in update");
                const formatData = {
                    start_date: data.start_date
                        ? new Date(data.start_date)
                        : vacation.start_date,
                    end_date: data.end_date ? new Date(data.end_date) : vacation.end_date,
                    reason: data.reason ? data.reason : vacation.reason,
                };
                yield prisma_1.default.vacation.update({
                    where: { id: vacationId },
                    data: formatData,
                });
                return response_service_1.httpResponse.http200("Vacation updated");
            }
            catch (error) {
                console.log(error);
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    delete(vacationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacation = yield prisma_1.default.vacation.findFirst({
                    where: { id: vacationId },
                });
                if (!vacation)
                    return response_service_1.httpResponse.http400("Error in deleted");
                yield prisma_1.default.vacation.delete({ where: { id: vacationId } });
                return response_service_1.httpResponse.http200("Vacation deleted");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((row) => __awaiter(this, void 0, void 0, function* () {
                    const start_date = report_service_1.reportService.excelSerialDateToJSDate(row.fecha_inicio);
                    const end_date = report_service_1.reportService.excelSerialDateToJSDate(row.fecha_fin);
                    const worker = yield prisma_1.default.worker.findFirst({
                        where: { dni: String(row.dni) },
                    });
                    if (worker) {
                        const formatData = {
                            worker_id: worker.id,
                            start_date,
                            end_date,
                            reason: row.motivo,
                        };
                        yield prisma_1.default.vacation.create({ data: formatData });
                    }
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Register vacations ok");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.vacationService = new VacationService();

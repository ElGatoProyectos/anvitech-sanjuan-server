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
exports.scheduleService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const xlsx = __importStar(require("xlsx"));
const shedule_dto_1 = require("../schemas/shedule.dto");
const worker_service_1 = require("./worker.service");
const prisma_1 = __importDefault(require("../prisma"));
class ScheduleService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedules = yield prisma_1.default.schedule.findMany({
                    include: {
                        worker: true,
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All schedules", schedules);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findScheduleForWorker(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield prisma_1.default.schedule.findFirst({
                    where: { worker_id: workerId },
                });
                if (!schedule)
                    return response_service_1.httpResponse.http404("Schedule not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Schedule worker", schedule);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createScheduleMassive(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const created = yield prisma_1.default.schedule.create({ data });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Schedule created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createScheduleDefault(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataSet = {
                    worker_id: workerId,
                    lunes: "07:30-15:00",
                    martes: "07:30-15:00",
                    miercoles: "07:30-15:00",
                    jueves: "07:30-15:00",
                    viernes: "07:30-15:00",
                    sabado: "",
                    domingo: "",
                    comments: "",
                };
                const created = yield prisma_1.default.schedule.create({ data: dataSet });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Schedule created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createScheduleForWorker(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dataSet = {
                    worker_id: Number(data.workerId),
                    lunes: data.schedule[0].hours.start + "-" + data.schedule[0].hours.end,
                    martes: data.schedule[1].hours.start + "-" + data.schedule[1].hours.end,
                    miercoles: data.schedule[2].hours.start + "-" + data.schedule[2].hours.end,
                    jueves: data.schedule[3].hours.start + "-" + data.schedule[3].hours.end,
                    viernes: data.schedule[4].hours.start + "-" + data.schedule[4].hours.end,
                    sabado: data.schedule[5].hours.start + "-" + data.schedule[5].hours.end,
                    domingo: "",
                    comments: data.comments,
                };
                const scheduleResponse = yield this.findScheduleForWorker(Number(data.workerId));
                if (!scheduleResponse.ok) {
                    const created = yield prisma_1.default.schedule.create({ data: dataSet });
                    return response_service_1.httpResponse.http201("Schedule created", created);
                }
                else {
                    const updated = yield prisma_1.default.schedule.update({
                        where: { worker_id: Number(data.workerId) },
                        data: dataSet,
                    });
                    yield prisma_1.default.$disconnect();
                    return response_service_1.httpResponse.http201("Schedule updated", updated);
                }
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
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
                const exampleData = sheetToJson[0];
                shedule_dto_1.formatSheduleDto.parse(exampleData);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const worker = yield worker_service_1.workerService.findByDNI(item.dni);
                    const format = {
                        worker_id: worker.content.id,
                        lunes: item.lunes,
                        martes: item.martes,
                        miercoles: item.miercoles,
                        jueves: item.juves,
                        viernes: item.viernes,
                        sabado: item.sabado,
                        domingo: item.domingo,
                        comments: "",
                        type: "default",
                    };
                    yield prisma_1.default.schedule.update({
                        where: { worker_id: worker.content.id },
                        data: format,
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Workers updated");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    // =================
    findTypeSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const typesSchedules = yield prisma_1.default.typeSchedule.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All types schedules", typesSchedules);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createTypeSchedule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const created = yield prisma_1.default.typeSchedule.create({ data });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Type schedule creayed", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    updateTypeSchedule(typScheduleId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedTypeSchedule = yield prisma_1.default.typeSchedule.update({
                    where: { id: typScheduleId },
                    data,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Type schedule updated", updatedTypeSchedule);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.scheduleService = new ScheduleService();

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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const xlsx = __importStar(require("xlsx"));
const date_transform_1 = require("../functions/date-transform");
const worker_dto_1 = require("../schemas/worker.dto");
const schedule_service_1 = require("./schedule.service");
const report_service_1 = require("./report.service");
const prisma_1 = __importDefault(require("../prisma"));
const workers_constant_1 = require("../constants/workers.constant");
class WorkerService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workers = yield prisma_1.default.worker.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All workers", workers);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findAllNoDisable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workers = yield prisma_1.default.worker.findMany({
                    where: { enabled: "si" },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All workers", workers);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const worker = yield prisma_1.default.worker.findFirst({ where: { id } });
                if (!worker)
                    return response_service_1.httpResponse.http404("Worker not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Worker found", worker);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const worker = yield prisma_1.default.worker.findFirst({ where: { id } });
                if (!worker)
                    return response_service_1.httpResponse.http404("Worker not found");
                yield prisma_1.default.schedule.delete({ where: { worker_id: id } });
                yield prisma_1.default.detailReport.deleteMany({ where: { dni: worker.dni } });
                yield prisma_1.default.vacation.deleteMany({ where: { worker_id: worker.id } });
                yield prisma_1.default.licence.deleteMany({ where: { worker_id: worker.id } });
                yield prisma_1.default.medicalRest.deleteMany({ where: { worker_id: worker.id } });
                yield prisma_1.default.permissions.deleteMany({ where: { worker_id: worker.id } });
                yield prisma_1.default.worker.delete({ where: { id } });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Worker deleted", worker);
            }
            catch (error) {
                console.log(error);
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    /// registros masivos ok, deben evitarse ingresar registros duplicados en el excel si no ninguno se registrara
    fileToRegisterMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                //- pendiente la validacion de esquemas con zod
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const hireDate = (0, date_transform_1.excelSerialDateToJSDate)(item.fecha_contratacion);
                    const formatData = {
                        full_name: item.nombres,
                        type_contract: item.tipo_contrato,
                        dni: item.dni.toString(),
                        type_dni: item.tipo_documento,
                        department: item.departamento ? item.departamento : "No definido",
                        position: item.posicion ? item.posicion : "No definido",
                        enabled: item.estado === "ACTIVO" ? "si" : "no",
                        hire_date: hireDate.toISOString(),
                        supervisor: item.supervisor === "" ? "No definido" : item.supervisor,
                        coordinator: item.coordinador === "" ? "No definido" : item.coordinador,
                        management: item.gestor_comercial === ""
                            ? "No definido"
                            : item.gestor_comercial,
                    };
                    const workers = yield prisma_1.default.worker.findMany();
                    yield prisma_1.default.$disconnect();
                    if (workers.length >= workers_constant_1.maxWorkers) {
                        return response_service_1.httpResponse.http400("Error, trabajadores maximos");
                    }
                    yield prisma_1.default.worker.create({ data: formatData });
                })));
                /// registrar los horarios por defecto
                const formatSchedule = {
                    lunes: "09:00-18:00",
                    martes: "09:00-18:00",
                    miercoles: "09:00-18:00",
                    jueves: "09:00-18:00",
                    viernes: "09:00-18:00",
                    sabado: "09:00-18:00",
                    domingo: "",
                    type: "default",
                };
                const { content: workers } = yield this.findAll();
                yield Promise.all(workers.map((w) => __awaiter(this, void 0, void 0, function* () {
                    const wFormat = Object.assign(Object.assign({}, formatSchedule), { worker_id: w.id });
                    yield schedule_service_1.scheduleService.createScheduleMassive(wFormat);
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Workers created");
            }
            catch (error) {
                console.log(error);
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workers = yield prisma_1.default.worker.findMany();
                yield prisma_1.default.$disconnect();
                if (workers.length >= workers_constant_1.maxWorkers) {
                    return response_service_1.httpResponse.http400("Error, trabajadores maximos");
                }
                worker_dto_1.createWorkerDTO.parse(data);
                const formatData = Object.assign(Object.assign({}, data), { hire_date: (0, date_transform_1.formatDateForPrisma)(data.hire_date) });
                const created = yield prisma_1.default.worker.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Worker created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createNoHireDate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workers = yield prisma_1.default.worker.findMany();
                if (workers.length >= workers_constant_1.maxWorkers) {
                    console.log("Llego al maximo");
                    return response_service_1.httpResponse.http400();
                }
                const created = yield prisma_1.default.worker.create({ data });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Worker created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findDepartmentDistinct() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const departments = yield prisma_1.default.worker.findMany({
                    distinct: ["department"],
                    select: {
                        department: true,
                    },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Departments distinct", departments);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findByDNI(dni) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const worker = yield prisma_1.default.worker.findFirst({
                    where: { dni: dni },
                });
                yield prisma_1.default.$disconnect();
                if (!worker)
                    return response_service_1.httpResponse.http400("Worker not found");
                return response_service_1.httpResponse.http200("Worker found", worker);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    updateTerminationDate(data, workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (data.restore) {
                    const worker = yield prisma_1.default.worker.update({
                        where: { id: workerId },
                        data: {
                            termination_date: null,
                            reason: "",
                            enabled: "si",
                        },
                    });
                    return response_service_1.httpResponse.http200("Worker updated", worker);
                }
                else {
                    const worker = yield prisma_1.default.worker.update({
                        where: { id: workerId },
                        data: {
                            termination_date: new Date(data.termination_date),
                            reason: data.reason,
                            enabled: "no",
                        },
                    });
                    const formatDate = new Date(data.termination_date);
                    formatDate.setHours(0, 0, 0, 0);
                    const nextDay = new Date(formatDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    // borra datos del mismo dia
                    yield prisma_1.default.detailReport.deleteMany({
                        where: { dni: worker.dni, fecha_reporte: { gte: nextDay } },
                    });
                    yield prisma_1.default.$disconnect();
                    return response_service_1.httpResponse.http200("Worker updated", worker);
                }
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    updateWorker(data, workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hire_date, id } = data, restData = __rest(data, ["hire_date", "id"]);
                const formatData = Object.assign(Object.assign({}, restData), { hire_date: new Date(hire_date) });
                const updated = yield prisma_1.default.worker.update({
                    where: { id: workerId },
                    data: formatData,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Worker updated", updated);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerTerminationMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const dateFormat = (0, date_transform_1.excelSerialDateToJSDate)(item.fecha_cese);
                    if (item.dni === "" || item.fecha_cese === "")
                        throw new Error("Error in service");
                    yield prisma_1.default.worker.update({
                        where: { dni: String(item.dni) },
                        data: {
                            termination_date: dateFormat,
                            reason: item.motivo,
                            enabled: "no",
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Updated");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    updateSupervisorMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.dni === "")
                        throw new Error("Error in service");
                    yield prisma_1.default.worker.update({
                        where: { dni: String(item.dni) },
                        data: {
                            supervisor: item.supervisor,
                            coordinator: item.coordinador,
                            management: item.generate_comercial,
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Updated");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerVacationMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.dni === "" ||
                        item.fecha_inicio === "" ||
                        item.fecha_fin === "")
                        throw new Error("Error in service");
                    const worker = yield exports.workerService.findByDNI(String(item.dni));
                    yield prisma_1.default.vacation.create({
                        data: {
                            worker_id: worker.content.id,
                            start_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_inicio),
                            end_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_fin),
                            reason: item.contexto,
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Register vacation successfull!");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerLincensesMasive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.dni === "" ||
                        item.fecha_inicio === "" ||
                        item.fecha_fin === "")
                        throw new Error("Error in service");
                    const worker = yield exports.workerService.findByDNI(String(item.dni));
                    yield prisma_1.default.licence.create({
                        data: {
                            worker_id: worker.content.id,
                            start_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_inicio),
                            end_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_fin),
                            reason: item.contexto,
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Register vacation successfull!");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerMedicalRestMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.dni === "" ||
                        item.fecha_inicio === "" ||
                        item.fecha_fin === "")
                        throw new Error("Error in service");
                    const worker = yield exports.workerService.findByDNI(String(item.dni));
                    yield prisma_1.default.medicalRest.create({
                        data: {
                            worker_id: worker.content.id,
                            start_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_inicio),
                            end_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_fin),
                            reason: item.contexto,
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Register vacation successfull!");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerPermissionsMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.dni === "" ||
                        item.fecha_inicio === "" ||
                        item.fecha_fin === "")
                        throw new Error("Error in service");
                    const worker = yield exports.workerService.findByDNI(String(item.dni));
                    yield prisma_1.default.permissions.create({
                        data: {
                            worker_id: worker.content.id,
                            start_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_inicio),
                            end_date: report_service_1.reportService.excelSerialDateToJSDate(item.fecha_fin),
                            reason: item.contexto,
                        },
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Register vacation successfull!");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findSupervisors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workers = yield prisma_1.default.worker.findMany({
                    where: { type_contract: "SUPERVISOR" },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All workers", workers);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    deleteWorker(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield prisma_1.default.worker.delete({ where: { id: workerId } });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Delete worker");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.workerService = new WorkerService();

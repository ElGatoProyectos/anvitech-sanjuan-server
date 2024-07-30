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
exports.scheduleController = void 0;
const multer_1 = __importDefault(require("multer"));
const schedule_service_1 = require("../service/schedule.service");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
class ScheduleController {
    schedulePost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield schedule_service_1.scheduleService.createScheduleForWorker(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    scheduleMassiveSchedulePost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // Usando multer para manejar la subida de archivos en memoria
            upload.single("file")(request, response, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return response.status(500).json({ error: "Error uploading file" });
                }
                const file = request.file;
                if (!file) {
                    return response.status(400).json({ error: "No file uploaded" });
                }
                try {
                    const serviceResponse = yield schedule_service_1.scheduleService.registerMassive(file);
                    response.status(200).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    scheduleTypePost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield schedule_service_1.scheduleService.createTypeSchedule(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    scheduleTypeGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield schedule_service_1.scheduleService.findTypeSchedule();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    scheduleTypeIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const data = request.body;
                const responseUpdated = yield schedule_service_1.scheduleService.updateTypeSchedule(id, data);
                response.status(responseUpdated.statusCode).json(responseUpdated.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    scheduleWorkerIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield schedule_service_1.scheduleService.findScheduleForWorker(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.scheduleController = new ScheduleController();

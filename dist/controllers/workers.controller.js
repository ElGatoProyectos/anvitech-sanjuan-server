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
exports.workerController = void 0;
const worker_service_1 = require("../service/worker.service");
const multer_1 = __importDefault(require("multer"));
const licence_service_1 = require("../service/licence.service");
const vacation_service_1 = require("../service/vacation.service");
const medical_rest_service_1 = require("../service/medical-rest.service");
const permission_service_1 = require("../service/permission.service");
const schedule_service_1 = require("../service/schedule.service");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
class WorkerController {
    workerGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield worker_service_1.workerService.findAll();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // POST method for creating a new worker
    workerPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield worker_service_1.workerService.create(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield worker_service_1.workerService.findById(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerIdDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield worker_service_1.workerService.deleteById(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // PUT method for updating a worker by ID
    workerIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const data = request.body;
                const serviceResponse = yield worker_service_1.workerService.updateWorker(data, id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerDepartmentsGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield worker_service_1.workerService.findDepartmentDistinct();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json({ errrrrr: error });
            }
        });
    }
    workerFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.fileToRegisterMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerLicencesPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield licence_service_1.licenceService.registerLicence(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerLicenceIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield licence_service_1.licenceService.findByWorker(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerLicenceFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.registerLincensesMasive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerLicenceMinIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield licence_service_1.licenceService.findLasts(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerMassiveVacationPost(request, response) {
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
                    const serviceResponse = yield vacation_service_1.vacationService.registerMassive(file);
                    response
                        .status(serviceResponse.statusCode)
                        .json(serviceResponse.content);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerMedicalRestPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Asumiendo que el cuerpo de la solicitud es JSON
                const body = request.body;
                const serviceResponse = yield medical_rest_service_1.medicalRestService.registerMedicalRest(body);
                response.status(200).json(serviceResponse);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerMedicalRestIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield medical_rest_service_1.medicalRestService.findByWorker(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerMedicalRestFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.registerMedicalRestMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerMedicalRestMinGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield medical_rest_service_1.medicalRestService.findLasts(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerPermissionFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.registerPermissionsMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerPermissionIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield permission_service_1.permissionService.findByWorker(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerPermissionMinIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield permission_service_1.permissionService.findLasts(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerScheduleGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield schedule_service_1.scheduleService.findAll();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerSupervisorGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield worker_service_1.workerService.findSupervisors();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerSupervisorFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.updateSupervisorMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerTerminationFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.registerTerminationMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
    workerTerminationIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const body = request.body;
                const serviceResponse = yield worker_service_1.workerService.updateTerminationDate(body, workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerVacationIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield vacation_service_1.vacationService.findByWorker(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerVacationMinIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = Number(request.params.id);
                const serviceResponse = yield vacation_service_1.vacationService.findLasts(workerId);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    workerVacationFilePost(request, response) {
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
                    const serviceResponse = yield worker_service_1.workerService.registerVacationMassive(file);
                    response.status(serviceResponse.statusCode).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
}
exports.workerController = new WorkerController();

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = void 0;
const user_service_1 = require("../service/user.service");
const report_service_1 = require("../service/report.service");
const incident_service_1 = require("../service/incident.service");
const permission_service_1 = require("../service/permission.service");
const licence_service_1 = require("../service/licence.service");
const medical_rest_service_1 = require("../service/medical-rest.service");
class Controller {
    // todo used
    createAdmin(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = request.body;
                const res = yield user_service_1.userService.createAdmin(data);
                response.status(200).json(res);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    detailReportPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = request.params.id;
                const data = request.body;
                const res = yield report_service_1.reportService.updateDetailReport(data, Number(id));
                response.status(200).json(res);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    incidentGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incidentsResponse = yield incident_service_1.incidentService.findAll();
                response
                    .status(incidentsResponse.statusCode)
                    .json(incidentsResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    incidentPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incident = request.body;
                const responseCreate = yield incident_service_1.incidentService.create(incident);
                response.status(responseCreate.statusCode).json(responseCreate.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    incidentGetId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const incidentResponse = yield incident_service_1.incidentService.findById(id);
                response
                    .status(incidentResponse.statusCode)
                    .json(incidentResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    incidentPutId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const incident = request.body;
                const responseUpdated = yield incident_service_1.incidentService.update(incident, id);
                response.status(responseUpdated.statusCode).json(responseUpdated.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // todo used
    permissionPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield permission_service_1.permissionService.create(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    permissionIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield permission_service_1.permissionService.edit(body, Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    permissionIdDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield permission_service_1.permissionService.delete(Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    licensePutId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield licence_service_1.licenceService.edit(body, Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    licenseDeleteId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield licence_service_1.licenceService.delete(Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    MedicalRestPutId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield medical_rest_service_1.medicalRestService.edit(body, Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    MedicalRestDeleteId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield medical_rest_service_1.medicalRestService.delete(Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.controller = new Controller();

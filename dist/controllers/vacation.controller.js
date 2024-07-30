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
exports.vacationController = void 0;
const vacation_service_1 = require("../service/vacation.service");
class VacationController {
    vacationPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield vacation_service_1.vacationService.create(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    vacationIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const id = request.params.id;
                const serviceResponse = yield vacation_service_1.vacationService.edit(body, Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    vacationIdDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = request.params.id;
                const serviceResponse = yield vacation_service_1.vacationService.delete(Number(id));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.vacationController = new VacationController();

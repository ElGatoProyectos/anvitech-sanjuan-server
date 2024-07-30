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
exports.terminationController = void 0;
const termination_service_1 = require("../service/termination.service");
class TerminationController {
    terminationsGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield termination_service_1.terminationService.findAll();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // POST method for creating a termination
    terminationsPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = request.body;
                const serviceResponse = yield termination_service_1.terminationService.create(data);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    terminationIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const data = request.body;
                const serviceResponse = yield termination_service_1.terminationService.update(data, id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.terminationController = new TerminationController();

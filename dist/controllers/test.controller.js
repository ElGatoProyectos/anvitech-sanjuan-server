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
exports.testController = void 0;
const data_service_1 = require("../service/data.service");
class TestController {
    testGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const date = new Date();
                const serviceResponse = yield data_service_1.dataService.instanceDataInit(19, 19, 2024, 6);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    testDayPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { day, month, year } = request.body;
                const serviceResponse = yield data_service_1.dataService.instanceDataInit(Number(day), Number(day), Number(year), Number(month));
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.testController = new TestController();

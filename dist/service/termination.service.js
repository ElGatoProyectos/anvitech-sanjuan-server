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
exports.terminationService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
class TerminationService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const terminations = yield prisma_1.default.typeTermination.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All terminations", terminations);
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
                const terminations = yield prisma_1.default.typeTermination.create({ data });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Termination created", terminations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    update(data, terminationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const terminations = yield prisma_1.default.typeTermination.update({
                    where: { id: terminationId },
                    data,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Update termination", terminations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.terminationService = new TerminationService();

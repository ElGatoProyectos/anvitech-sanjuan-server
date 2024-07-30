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
exports.medicalRestService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
class MedicalRestService {
    registerMedicalRest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formatData = Object.assign(Object.assign({}, data), { start_date: new Date(data.start_date), end_date: new Date(data.end_date) });
                const created = yield prisma_1.default.medicalRest.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Medical rest created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findLasts(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield prisma_1.default.medicalRest.findMany({
                    where: { worker_id: workerId },
                    orderBy: {
                        id: "desc",
                    },
                    take: 5,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Medical rest ", data);
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
                const data = yield prisma_1.default.medicalRest.findMany({
                    where: { worker_id: workerId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All Medical rest ", data);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    edit(data, medicalRestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medicalRest = yield prisma_1.default.medicalRest.findFirst({
                    where: { id: medicalRestId },
                });
                if (!medicalRest)
                    return response_service_1.httpResponse.http400("Error in update");
                const formatData = {
                    start_date: data.start_date
                        ? new Date(data.start_date)
                        : medicalRest.start_date,
                    end_date: data.end_date
                        ? new Date(data.end_date)
                        : medicalRest.end_date,
                    reason: data.reason ? data.reason : medicalRest.reason,
                };
                yield prisma_1.default.medicalRest.update({
                    where: { id: medicalRestId },
                    data: formatData,
                });
                return response_service_1.httpResponse.http200("Medical rest updated");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    delete(medicalRestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medicalRest = yield prisma_1.default.medicalRest.findFirst({
                    where: { id: medicalRestId },
                });
                if (!medicalRest)
                    return response_service_1.httpResponse.http400("Error in deleted");
                yield prisma_1.default.medicalRest.delete({ where: { id: medicalRestId } });
                return response_service_1.httpResponse.http200("Medical rest deleted");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.medicalRestService = new MedicalRestService();

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
exports.licenceService = void 0;
const response_service_1 = require("./response.service");
const errors_service_1 = require("./errors.service");
const prisma_1 = __importDefault(require("../prisma"));
class LicenceService {
    registerLicence(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formatData = Object.assign(Object.assign({}, data), { start_date: new Date(data.start_date), end_date: new Date(data.end_date) });
                const created = yield prisma_1.default.licence.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Lincence created", created);
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
                const data = yield prisma_1.default.licence.findMany({
                    where: { worker_id: workerId },
                    orderBy: {
                        id: "desc",
                    },
                    take: 5,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Licences", data);
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
                const data = yield prisma_1.default.licence.findMany({
                    where: { worker_id: workerId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All licences", data);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    edit(data, licenseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const licence = yield prisma_1.default.licence.findFirst({
                    where: { id: licenseId },
                });
                if (!licence)
                    return response_service_1.httpResponse.http400("Error in update");
                const formatData = {
                    start_date: data.start_date
                        ? new Date(data.start_date)
                        : licence.start_date,
                    end_date: data.end_date ? new Date(data.end_date) : licence.end_date,
                    reason: data.reason ? data.reason : licence.reason,
                };
                yield prisma_1.default.licence.update({
                    where: { id: licenseId },
                    data: formatData,
                });
                return response_service_1.httpResponse.http200("License updated");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    delete(licenseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const licence = yield prisma_1.default.licence.findFirst({
                    where: { id: licenseId },
                });
                if (!licence)
                    return response_service_1.httpResponse.http400("Error in deleted");
                yield prisma_1.default.licence.delete({ where: { id: licenseId } });
                return response_service_1.httpResponse.http200("License deleted");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.licenceService = new LicenceService();

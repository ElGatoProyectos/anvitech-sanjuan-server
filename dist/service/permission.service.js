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
exports.permissionService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
class PermissionService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) { }
        });
    }
    findLasts(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacations = yield prisma_1.default.permissions.findMany({
                    where: { worker_id: workerId },
                    orderBy: {
                        id: "desc",
                    },
                    take: 5,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Permissions", vacations);
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
                const vacations = yield prisma_1.default.permissions.findMany({
                    where: { worker_id: workerId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All permissions", vacations);
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
                const formatData = Object.assign(Object.assign({}, data), { start_date: new Date(data.start_date), end_date: new Date(data.end_date) });
                const vacations = yield prisma_1.default.permissions.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Permission created", vacations);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    edit(data, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissions = yield prisma_1.default.permissions.findFirst({
                    where: { id: permissionId },
                });
                if (!permissions)
                    return response_service_1.httpResponse.http400("Error in update");
                const formatData = {
                    start_date: data.start_date
                        ? new Date(data.start_date)
                        : permissions.start_date,
                    end_date: data.end_date
                        ? new Date(data.end_date)
                        : permissions.end_date,
                    reason: data.reason ? data.reason : permissions.reason,
                };
                yield prisma_1.default.permissions.update({
                    where: { id: permissionId },
                    data: formatData,
                });
                return response_service_1.httpResponse.http200("Medical rest updated");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    delete(permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissions = yield prisma_1.default.permissions.findFirst({
                    where: { id: permissionId },
                });
                if (!permissions)
                    return response_service_1.httpResponse.http400("Error in deleted");
                yield prisma_1.default.permissions.delete({ where: { id: permissionId } });
                return response_service_1.httpResponse.http200("Medical rest deleted");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.permissionService = new PermissionService();

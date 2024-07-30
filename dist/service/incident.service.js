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
exports.incidentService = void 0;
const response_service_1 = require("./response.service");
const errors_service_1 = require("./errors.service");
const prisma_1 = __importDefault(require("../prisma"));
class IncidentService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incidents = yield prisma_1.default.incident.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("All incidents", incidents);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incident = yield prisma_1.default.incident.findFirst({ where: { id } });
                if (!incident)
                    return response_service_1.httpResponse.http404("Incident not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Incident found", incident);
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
                const formatData = {
                    title: data.title,
                    description: data.description,
                    date: new Date(data.date).toISOString(),
                };
                const created = yield prisma_1.default.incident.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Incidente created", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    update(data, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formatData = {
                    title: data.title,
                    description: data.description,
                    date: new Date(data.date).toISOString(),
                };
                const updated = yield prisma_1.default.incident.update({
                    where: { id },
                    data: formatData,
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Incident updated", updated);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.incidentService = new IncidentService();

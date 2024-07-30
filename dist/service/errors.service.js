"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorService = void 0;
const zod_1 = require("zod");
const response_service_1 = require("./response.service");
class ErrorService {
    handleErrorSchema(error) {
        if (error instanceof zod_1.ZodError) {
            const validationErrors = error.errors;
            return response_service_1.httpResponse.http400("Error in validation schema", validationErrors);
        }
        else {
            return response_service_1.httpResponse.http500("Error in server", error);
        }
    }
}
exports.errorService = new ErrorService();

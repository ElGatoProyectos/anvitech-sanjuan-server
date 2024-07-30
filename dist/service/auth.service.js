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
exports.authService = void 0;
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
const user_service_1 = require("./user.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const responseUser = yield user_service_1.userService.findUserByUsername(data.username);
                if (!responseUser.ok)
                    return responseUser;
                const responseUserEnabled = yield user_service_1.userService.findById(responseUser.content.id);
                if (responseUserEnabled.content.enabled === "0")
                    return response_service_1.httpResponse.http401("Error in authentication");
                if (bcrypt_1.default.compareSync(data.password, responseUser.content.password))
                    return response_service_1.httpResponse.http200("Login correct", responseUser.content);
                return response_service_1.httpResponse.http401("Error in Auth", {
                    message: "Error in auth",
                });
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    validationAdmin(session) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = session;
                if (user.role === "admin" || user.role === "superadmin") {
                    return response_service_1.httpResponse.http200("Authentication ok", null);
                }
                else
                    return response_service_1.httpResponse.http401("Error in authentication");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    validationUser(session) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = session;
                if (user.role === "user" ||
                    user.role === "admin" ||
                    user.role === "superadmin") {
                    const responseUser = yield user_service_1.userService.findById(user.id);
                    if (!responseUser.ok || responseUser.content.enabled === "0")
                        return response_service_1.httpResponse.http401("Error in authentication");
                    else
                        return response_service_1.httpResponse.http200("Authentication ok");
                }
                else
                    return response_service_1.httpResponse.http401("Error in authentication");
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.authService = new AuthService();

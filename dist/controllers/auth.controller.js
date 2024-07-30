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
exports.authController = void 0;
const user_service_1 = require("../service/user.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthController {
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = yield request.body;
                const responseData = yield user_service_1.userService.findByDni(username);
                if (!responseData.ok) {
                    response
                        .status(401)
                        .json({ message: "Error in authorization request" });
                }
                else {
                    const responseCompare = bcrypt_1.default.compareSync(password, responseData.content.password);
                    if (responseCompare) {
                        const formatData = {
                            id: responseData.content.id,
                            role: responseData.content.role,
                            username: responseData.content.username,
                        };
                        response.status(200).json(formatData);
                    }
                    else {
                        response
                            .status(401)
                            .json({ message: "Error in authorization request" });
                    }
                }
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.authController = new AuthController();

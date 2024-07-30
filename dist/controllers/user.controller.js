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
exports.userController = void 0;
const user_service_1 = require("../service/user.service");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
class UserController {
    userGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceResponse = yield user_service_1.userService.findAll();
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // POST method for creating a new user
    userPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = request.body;
                const serviceResponse = yield user_service_1.userService.createUser(body);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    userIdGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield user_service_1.userService.findById(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // PUT method for updating a user by ID
    userIdPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const body = request.body;
                const serviceResponse = yield user_service_1.userService.updateUser(body, id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    // DELETE method for deleting a user by ID
    userIdDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(request.params.id);
                const serviceResponse = yield user_service_1.userService.deleteUser(id);
                response.status(serviceResponse.statusCode).json(serviceResponse.content);
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
    userFilePost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // Usando multer para manejar la subida de archivos en memoria
            upload.single("file")(request, response, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return response.status(500).json({ error: "Error uploading file" });
                }
                const file = request.file;
                if (!file) {
                    return response.status(400).json({ error: "No file uploaded" });
                }
                try {
                    const serviceResponse = yield user_service_1.userService.registerMassive(file);
                    response.status(200).json(serviceResponse);
                }
                catch (error) {
                    response.status(500).json(error);
                }
            }));
        });
    }
}
exports.userController = new UserController();

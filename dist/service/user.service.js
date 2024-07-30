"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const response_service_1 = require("./response.service");
const errors_service_1 = require("./errors.service");
const user_dto_1 = require("../schemas/user.dto");
const xlsx = __importStar(require("xlsx"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
class UserService {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma_1.default.user.findMany();
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Users found", users);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findByDni(dni) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findFirst({ where: { dni } });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("User found", user);
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
                const user = yield prisma_1.default.user.findFirst({ where: { id } });
                if (!user)
                    return response_service_1.httpResponse.http404("User not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("User found", user);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findFirst({
                    where: { username },
                });
                if (!user)
                    return response_service_1.httpResponse.http400("User not found");
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("User found", user);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user_dto_1.createUserDTO.parse(data);
                const password = bcrypt_1.default.hashSync(data.dni, 11);
                const dataSet = {
                    full_name: data.full_name,
                    dni: data.dni,
                    email: data.email,
                    password,
                    username: data.dni,
                    enabled: true,
                    role: "user",
                };
                const created = yield prisma_1.default.user.create({ data: dataSet });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("User created ok!", created);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    updateUser(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // updateUserDTO.parse(data);
                let updatedUser;
                if (data.password === "") {
                    const { password } = data, allData = __rest(data, ["password"]);
                    updatedUser = yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: allData,
                    });
                }
                else {
                    const formatData = Object.assign(Object.assign({}, data), { password: bcrypt_1.default.hashSync(data.password, 11) });
                    updatedUser = yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: formatData,
                    });
                }
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("User updated ok!", updatedUser);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield prisma_1.default.user.delete({
                    where: { id: userId },
                });
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("User deleted ok!");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    createAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { validate } = data;
                if (validate === "1234abc") {
                    const admin = {
                        full_name: "QUISPE FERNANDEZ HECTOR JUAN",
                        dni: "06763716",
                        email: "admin@gmail.com",
                        password: bcrypt_1.default.hashSync("06763716", 11),
                        username: "06763716",
                        enabled: true,
                        role: "admin",
                    };
                    // const admin2 = {
                    //   full_name: "JOSE FERNANDO ROJAS RUIZ",
                    //   dni: "45843270",
                    //   email: "admin@gmail.com",
                    //   password: bcrypt.hashSync("45843270", 11),
                    //   username: "45843270",
                    //   enabled: true,
                    //   role: "admin",
                    // };
                    const superadmin = {
                        full_name: "VILCHEZ MARTINEZ SEGUNDO JUAN DE MATTA",
                        dni: "08464558",
                        email: "superadmin@digimax.pe",
                        password: bcrypt_1.default.hashSync("08464558", 11),
                        username: "08464558",
                        enabled: true,
                        role: "superadmin",
                    };
                    yield prisma_1.default.user.create({ data: admin });
                    // await prisma.user.create({ data: admin2 });
                    yield prisma_1.default.user.create({ data: superadmin });
                }
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Admins created");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    registerMassive(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const bytes = await file.arrayBuffer();
                // const buffer = Buffer.from(bytes);
                const buffer = file.buffer;
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetToJson = xlsx.utils.sheet_to_json(sheet);
                const exampleData = sheetToJson[0];
                // formatUserDTO.parse(exampleData);
                yield Promise.all(sheetToJson.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const password = bcrypt_1.default.hashSync(String(item.dni), 11);
                    const format = {
                        full_name: item.nombres,
                        dni: item.dni,
                        phone: item.celular,
                        email: item.correo,
                        username: String(item.dni),
                        password,
                        role: item.rol,
                        enabled: true,
                    };
                    yield prisma_1.default.user.create({
                        data: format,
                    });
                })));
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http201("Users created");
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.userService = new UserService();

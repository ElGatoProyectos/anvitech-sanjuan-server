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
exports.anvizService = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_service_1 = require("./errors.service");
const response_service_1 = require("./response.service");
require("dotenv/config");
class AnvizService {
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post("https://api.us.crosschexcloud.com/", {
                    header: {
                        nameSpace: "authorize.token",
                        nameAction: "token",
                        version: "1.0",
                        requestId: "f1becc28-ad01-b5b2-7cef-392eb1526f39",
                        timestamp: "2022-10-21T07:39:07+00:00",
                    },
                    payload: {
                        api_key: process.env.CROSSCHEXCLOUD_API_KEY,
                        api_secret: process.env.CROSSCHEXCLOUD_API_SECRET,
                    },
                });
                return response_service_1.httpResponse.http200("Fetch ok!", {
                    token: response.data.payload.token,
                });
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    getData(token_1, begin_time_1, end_time_1) {
        return __awaiter(this, arguments, void 0, function* (token, begin_time, end_time, order = "asc", page = 1, per_page = 10000000000) {
            // begin_time: "2022-06-01T12:46:43+00:00",
            //       end_time: "2024-05-24T12:46:43+00:00",
            try {
                const response = yield axios_1.default.post("https://api.us.crosschexcloud.com/", {
                    header: {
                        nameSpace: "attendance.record",
                        nameAction: "getrecord",
                        version: "1.0",
                        requestId: "f1becc28-ad01-b5b2-7cef-392eb1526f39",
                        timestamp: "2022-10-21T07:39:07+00:00",
                    },
                    authorize: {
                        type: "token",
                        token,
                    },
                    payload: {
                        begin_time,
                        end_time,
                        order,
                        page,
                        per_page,
                    },
                });
                return response_service_1.httpResponse.http200("Fetch ok!", response.data);
            }
            catch (error) {
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
}
exports.anvizService = new AnvizService();

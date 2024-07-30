"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import router from "./routes/route";
const utils_1 = require("./utils/utils");
const router_test_1 = __importDefault(require("./routes/router-test"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, utils_1.cronStart)();
app.use("/api", router_test_1.default);
app.listen(4000, () => {
    console.log("this application is running in 4000");
});

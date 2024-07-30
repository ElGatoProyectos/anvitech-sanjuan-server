"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../controllers/controller");
const report_controller_1 = require("../controllers/report.controller");
const schedule_controller_1 = require("../controllers/schedule.controller");
const termination_controller_1 = require("../controllers/termination.controller");
const test_controller_1 = require("../controllers/test.controller");
const user_controller_1 = require("../controllers/user.controller");
const vacation_controller_1 = require("../controllers/vacation.controller");
const workers_controller_1 = require("../controllers/workers.controller");
const router = express_1.default.Router();
// Admin routes
router.post("/admin", controller_1.controller.createAdmin);
// Detail-report routes
router.get("/detail-report/:id", controller_1.controller.detailReportPut);
// Incidents routes
router.post("/incidents", controller_1.controller.incidentPost);
router.get("/incidents", controller_1.controller.incidentGet);
router.get("/incidents/:id", controller_1.controller.incidentGetId);
router.put("/incidents/:id", controller_1.controller.incidentPutId);
// Permissions routes
router.get("/permissions", controller_1.controller.permissionPost);
// Report-dynamic routes
router.post("/report-dynamic", (req, res) => {
    // Handler for /report-dynamic route
});
// Reports routes
router.get("/reports", report_controller_1.reportController.reportGet);
router.post("/reports", report_controller_1.reportController.reportPost);
router.get("/reports/:id", report_controller_1.reportController.reportIdGet);
router.get("/reports/day", report_controller_1.reportController.reportDayGet);
router.post("/reports/day", report_controller_1.reportController.reportDayPost);
router.post("/reports/detail", report_controller_1.reportController.reportDetailPost);
router.put("/reports/detail/:id", report_controller_1.reportController.reportDetailPut);
router.delete("/reports/detail/:id", report_controller_1.reportController.reportDetailDelete);
router.post("/reports/export", report_controller_1.reportController.reportExportPost);
router.post("/reports/export/starsoft", report_controller_1.reportController.reportExportStarsoftPost);
router.post("/reports/incident", report_controller_1.reportController.reportIncidentPost);
router.get("/reports/incident/:id", report_controller_1.reportController.reportIncidentIdGet);
router.delete("/reports/incident/:id", report_controller_1.reportController.reportIncidentIdDelete);
router.post("/reports/upload", report_controller_1.reportController.reportUploadPost);
router.post("/reports/upload-update", report_controller_1.reportController.reportUploadUpdatePost);
router.post("/reports/weekly", report_controller_1.reportController.reportWeeklyPost);
// Schedule routes
router.post("/schedule", schedule_controller_1.scheduleController.schedulePost);
router.post("/schedule/massive-schedule", schedule_controller_1.scheduleController.scheduleMassiveSchedulePost);
router.get("/schedule/type", schedule_controller_1.scheduleController.scheduleTypeGet);
router.post("/schedule/type", schedule_controller_1.scheduleController.scheduleTypePost);
router.put("/schedule/type/:id", schedule_controller_1.scheduleController.scheduleTypeIdPut);
router.get("/schedule/worker/:id", schedule_controller_1.scheduleController.scheduleWorkerIdGet);
// Terminations routes
router.get("/terminations", termination_controller_1.terminationController.terminationsGet);
router.post("/terminations", termination_controller_1.terminationController.terminationsPost);
router.put("/terminations/:id", termination_controller_1.terminationController.terminationIdPut);
// Test routes
router.get("/test", test_controller_1.testController.testGet);
router.post("/test/:day", test_controller_1.testController.testDayPost);
// Users routes
router.get("/users", user_controller_1.userController.userGet);
router.post("/users", user_controller_1.userController.userPost);
router.post("/users/file", user_controller_1.userController.userPost);
router.get("/users/:id", user_controller_1.userController.userIdGet);
router.put("/users/:id", user_controller_1.userController.userIdPut);
router.delete("/users/:id", user_controller_1.userController.userIdDelete);
// Utils routes
router.get("/utils/handleValidation", (req, res) => {
    // Handler for /utils/handleValidation route
});
// Vacations routes
router.post("/vacations", vacation_controller_1.vacationController.vacationPost);
// W-access-data routes
router.get("/w-access-data/:token", (req, res) => {
    // Handler for /w-access-data/:token route
});
// Workers routes
router.get("/workers/departments", workers_controller_1.workerController.workerDepartmentsGet);
router.get("/workers", workers_controller_1.workerController.workerGet);
router.post("/workers", workers_controller_1.workerController.workerPost);
router.get("/workers/:id", workers_controller_1.workerController.workerIdGet);
router.put("/workers/:id", workers_controller_1.workerController.workerIdPut);
router.post("/workers/file", workers_controller_1.workerController.workerFilePost);
router.post("/workers/licences", workers_controller_1.workerController.workerLicencesPost);
router.get("/workers/licences/:id", workers_controller_1.workerController.workerLicenceIdGet);
router.post("/workers/licences/file", workers_controller_1.workerController.workerLicenceFilePost);
router.get("/workers/licences/min/:id", workers_controller_1.workerController.workerLicenceMinIdGet);
router.post("/workers/massive-vacation", workers_controller_1.workerController.workerMassiveVacationPost);
router.post("/workers/medical-rests", workers_controller_1.workerController.workerMedicalRestPost);
router.post("/workers/medical-rests/file", workers_controller_1.workerController.workerMedicalRestFilePost);
router.get("/workers/medical-rests/min/:id", workers_controller_1.workerController.workerMedicalRestMinGet);
router.get("/workers/medical-rests/:id", workers_controller_1.workerController.workerMedicalRestIdGet);
router.post("/workers/permissions/file", workers_controller_1.workerController.workerPermissionFilePost);
router.get("/workers/permissions/min/:id", workers_controller_1.workerController.workerPermissionMinIdGet);
router.get("/workers/permissions/:id", workers_controller_1.workerController.workerPermissionIdGet);
router.get("/workers/schedule", workers_controller_1.workerController.workerScheduleGet);
router.post("/workers/supervisor/file", workers_controller_1.workerController.workerSupervisorFilePost);
router.get("/workers/supervisor", workers_controller_1.workerController.workerSupervisorGet);
router.post("/workers/termination/file", workers_controller_1.workerController.workerTerminationFilePost);
router.put("/workers/termination/:id", workers_controller_1.workerController.workerTerminationIdPut);
router.post("/workers/vacations/file", workers_controller_1.workerController.workerVacationFilePost);
router.get("/workers/vacations/min/:id", workers_controller_1.workerController.workerVacationMinIdGet);
router.get("/workers/vacations/:id", workers_controller_1.workerController.workerVacationIdGet);
exports.default = router;

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
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post("/auth", auth_controller_1.authController.login);
router.post("/reports/generate/day", report_controller_1.reportController.reportGenerateDate);
router.put("/detail-report/:id", controller_1.controller.detailReportPut);
// Incidents routes
router.get("/incidents/:id", controller_1.controller.incidentGetId);
router.get("/incidents/:id", controller_1.controller.incidentGetId);
// Permissions routes
router.post("/permissions", controller_1.controller.permissionPost);
router.put("/permissions/:id", controller_1.controller.permissionIdPut);
router.delete("/permissions/:id", controller_1.controller.permissionIdDelete);
router.put("/licences/:id", controller_1.controller.licensePutId);
router.delete("/licences/:id", controller_1.controller.licenseDeleteId);
router.put("/medical-rest/:id", controller_1.controller.MedicalRestPutId);
router.delete("/medical-rest/:id", controller_1.controller.MedicalRestDeleteId);
// Report-dynamic routes
router.post("/report-dynamic", (req, res) => {
    // Handler for /report-dynamic route
});
// Reports routes
router.get("/reports/:id", report_controller_1.reportController.reportIdGet);
router.get("/reports/day", report_controller_1.reportController.reportDayGet);
router.post("/reports/day", report_controller_1.reportController.reportDayPost);
router.post("/reports/detail", report_controller_1.reportController.reportDetailPost);
router.put("/reports/detail/:id", report_controller_1.reportController.reportDetailPut);
router.delete("/reports/detail/:id", report_controller_1.reportController.reportDetailDelete);
router.post("/reports/export", report_controller_1.reportController.reportExportPost);
router.post("/reports/export/starsoft", report_controller_1.reportController.reportExportStarsoftPost);
// new method report new startsoft
router.post("/reports/export/new-starsoft", report_controller_1.reportController.newReportExportStarsoftPost);
router.post("/reports/export/new-report-worker", report_controller_1.reportController.newReportForWorker);
router.post("/reports/export/new-model-report", report_controller_1.reportController.newModelReport);
router.post("/reports/incident", report_controller_1.reportController.reportIncidentPost);
router.get("/reports/incident/:id", report_controller_1.reportController.reportIncidentIdGet);
router.delete("/reports/incident/:id", report_controller_1.reportController.reportIncidentIdDelete);
router.post("/reports/upload", report_controller_1.reportController.reportUploadPost);
router.post("/reports/upload-update", report_controller_1.reportController.reportUploadUpdatePost);
router.post("/reports/weekly", report_controller_1.reportController.reportWeeklyPost);
// Schedule routes
router.get("/schedule/worker/:id", schedule_controller_1.scheduleController.scheduleWorkerIdGet);
router.post("/schedule/massive-schedule", schedule_controller_1.scheduleController.scheduleMassiveSchedulePost);
router.get("/schedule/type", schedule_controller_1.scheduleController.scheduleTypeGet);
router.post("/schedule/type", schedule_controller_1.scheduleController.scheduleTypePost);
router.put("/schedule/type/:id", schedule_controller_1.scheduleController.scheduleTypeIdPut);
// Terminations routes
router.put("/terminations/:id", termination_controller_1.terminationController.terminationIdPut);
// Test routes
router.post("/test/new", test_controller_1.testController.testDayPost);
// Users routes
router.get("/users/:id", user_controller_1.userController.userIdGet);
router.put("/users/:id", user_controller_1.userController.userIdPut);
router.delete("/users/:id", user_controller_1.userController.userIdDelete);
// Vacations routes
router.post("/vacations", vacation_controller_1.vacationController.vacationPost);
router.put("/vacations/:id", vacation_controller_1.vacationController.vacationIdPut);
router.delete("/vacations/:id", vacation_controller_1.vacationController.vacationIdDelete);
// W-access-data routes
router.get("/w-access-data/:token", (req, res) => {
    // Handler for /w-access-data/:token route
});
// Workers routes
router.get("/workers/supervisor", workers_controller_1.workerController.workerSupervisorGet);
router.get("/workers/departments", workers_controller_1.workerController.workerDepartmentsGet);
// se anadio un schedule
router.get("/workers/schedule", workers_controller_1.workerController.workerScheduleGet);
router.post("/schedule", schedule_controller_1.scheduleController.schedulePost);
router.get("/workers/:id", workers_controller_1.workerController.workerIdGet);
// add delete worker
router.delete("/workers/:id", workers_controller_1.workerController.workerIdDelete);
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
router.post("/workers/supervisor/file", workers_controller_1.workerController.workerSupervisorFilePost);
router.post("/workers/termination/file", workers_controller_1.workerController.workerTerminationFilePost);
router.put("/workers/termination/:id", workers_controller_1.workerController.workerTerminationIdPut);
router.post("/workers/vacations/file", workers_controller_1.workerController.workerVacationFilePost);
router.get("/workers/vacations/min/:id", workers_controller_1.workerController.workerVacationMinIdGet);
router.get("/workers/vacations/:id", workers_controller_1.workerController.workerVacationIdGet);
// Admin routes
router.post("/admin", controller_1.controller.createAdmin);
// General routes
router.get("/incidents", controller_1.controller.incidentGet);
router.post("/incidents", controller_1.controller.incidentPost);
router.get("/reports", report_controller_1.reportController.reportGet);
// reporte por trabajador
router.post("/reports/worker/:dni", report_controller_1.reportController.reportForWorkerDNIPost);
router.post("/reports", report_controller_1.reportController.reportPost);
router.get("/terminations", termination_controller_1.terminationController.terminationsGet);
router.post("/terminations", termination_controller_1.terminationController.terminationsPost);
router.get("/test", test_controller_1.testController.testGet);
router.get("/users", user_controller_1.userController.userGet);
router.post("/users", user_controller_1.userController.userPost);
router.get("/workers", workers_controller_1.workerController.workerGet);
router.post("/workers", workers_controller_1.workerController.workerPost);
// Utils routes
router.get("/utils/handleValidation", (req, res) => {
    // Handler for /utils/handleValidation route
});
exports.default = router;

import express from "express";
import { controller } from "../controllers/controller";
import { reportController } from "../controllers/report.controller";
import { scheduleController } from "../controllers/schedule.controller";
import { terminationController } from "../controllers/termination.controller";
import { testController } from "../controllers/test.controller";
import { userController } from "../controllers/user.controller";
import { vacationController } from "../controllers/vacation.controller";
import { workerController } from "../controllers/workers.controller";
import { authController } from "../controllers/auth.controller";

const router = express.Router();

router.post("/auth", authController.login);
router.post("/reports/generate/day", reportController.reportGenerateDate);

router.put("/detail-report/:id", controller.detailReportPut);

// Incidents routes
router.get("/incidents/:id", controller.incidentGetId);
router.get("/incidents/:id", controller.incidentGetId);

// Permissions routes
router.post("/permissions", controller.permissionPost);
router.put("/permissions/:id", controller.permissionIdPut);
router.delete("/permissions/:id", controller.permissionIdDelete);

router.put("/licences/:id", controller.licensePutId);
router.delete("/licences/:id", controller.licenseDeleteId);

router.put("/medical-rest/:id", controller.MedicalRestPutId);
router.delete("/medical-rest/:id", controller.MedicalRestDeleteId);

// Report-dynamic routes
router.post("/report-dynamic", (req, res) => {
  // Handler for /report-dynamic route
});

// Reports routes
router.get("/reports/:id", reportController.reportIdGet);
router.get("/reports/day", reportController.reportDayGet);
router.post("/reports/day", reportController.reportDayPost);
router.post("/reports/detail", reportController.reportDetailPost);
router.put("/reports/detail/:id", reportController.reportDetailPut);
router.delete("/reports/detail/:id", reportController.reportDetailDelete);
router.post("/reports/export", reportController.reportExportPost);
router.post(
  "/reports/export/starsoft",
  reportController.reportExportStarsoftPost
);

// new method report new startsoft
router.post(
  "/reports/export/new-starsoft",
  reportController.newReportExportStarsoftPost
);

router.post(
  "/reports/export/new-report-worker",
  reportController.newReportForWorker
);

router.post(
  "/reports/export/new-model-report",
  reportController.newModelReport
);

router.post("/reports/incident", reportController.reportIncidentPost);
router.get("/reports/incident/:id", reportController.reportIncidentIdGet);
router.delete("/reports/incident/:id", reportController.reportIncidentIdDelete);
router.post("/reports/upload", reportController.reportUploadPost);
router.post("/reports/upload-update", reportController.reportUploadUpdatePost);
router.post("/reports/weekly", reportController.reportWeeklyPost);

// Schedule routes
router.get("/schedule/worker/:id", scheduleController.scheduleWorkerIdGet);

router.post(
  "/schedule/massive-schedule",
  scheduleController.scheduleMassiveSchedulePost
);
router.get("/schedule/type", scheduleController.scheduleTypeGet);
router.post("/schedule/type", scheduleController.scheduleTypePost);
router.put("/schedule/type/:id", scheduleController.scheduleTypeIdPut);

// Terminations routes
router.put("/terminations/:id", terminationController.terminationIdPut);

// Test routes
router.post("/test/new", testController.testDayPost);

// Users routes
router.get("/users/:id", userController.userIdGet);
router.put("/users/:id", userController.userIdPut);
router.delete("/users/:id", userController.userIdDelete);

// Vacations routes
router.post("/vacations", vacationController.vacationPost);
router.put("/vacations/:id", vacationController.vacationIdPut);
router.delete("/vacations/:id", vacationController.vacationIdDelete);

// W-access-data routes
router.get("/w-access-data/:token", (req, res) => {
  // Handler for /w-access-data/:token route
});

// Workers routes
router.get("/workers/supervisor", workerController.workerSupervisorGet);
router.get("/workers/departments", workerController.workerDepartmentsGet);
// se anadio un schedule
router.get("/workers/schedule", workerController.workerScheduleGet);
router.post("/schedule", scheduleController.schedulePost);

router.get("/workers/:id", workerController.workerIdGet);
// add delete worker
router.delete("/workers/:id", workerController.workerIdDelete);

router.put("/workers/:id", workerController.workerIdPut);
router.post("/workers/file", workerController.workerFilePost);
router.post("/workers/licences", workerController.workerLicencesPost);
router.get("/workers/licences/:id", workerController.workerLicenceIdGet);

router.post("/workers/licences/file", workerController.workerLicenceFilePost);
router.get("/workers/licences/min/:id", workerController.workerLicenceMinIdGet);
router.post(
  "/workers/massive-vacation",
  workerController.workerMassiveVacationPost
);
router.post("/workers/medical-rests", workerController.workerMedicalRestPost);
router.post(
  "/workers/medical-rests/file",
  workerController.workerMedicalRestFilePost
);
router.get(
  "/workers/medical-rests/min/:id",
  workerController.workerMedicalRestMinGet
);
router.get(
  "/workers/medical-rests/:id",
  workerController.workerMedicalRestIdGet
);
router.post(
  "/workers/permissions/file",
  workerController.workerPermissionFilePost
);
router.get(
  "/workers/permissions/min/:id",
  workerController.workerPermissionMinIdGet
);
router.get("/workers/permissions/:id", workerController.workerPermissionIdGet);

router.post(
  "/workers/supervisor/file",
  workerController.workerSupervisorFilePost
);
router.post(
  "/workers/termination/file",
  workerController.workerTerminationFilePost
);
router.put("/workers/termination/:id", workerController.workerTerminationIdPut);
router.post("/workers/vacations/file", workerController.workerVacationFilePost);
router.get(
  "/workers/vacations/min/:id",
  workerController.workerVacationMinIdGet
);
router.get("/workers/vacations/:id", workerController.workerVacationIdGet);

// Admin routes
router.post("/admin", controller.createAdmin);

// General routes
router.get("/incidents", controller.incidentGet);
router.post("/incidents", controller.incidentPost);
router.get("/reports", reportController.reportGet);
// reporte por trabajador
router.post("/reports/worker/:dni", reportController.reportForWorkerDNIPost);

router.post("/reports", reportController.reportPost);
router.get("/terminations", terminationController.terminationsGet);
router.post("/terminations", terminationController.terminationsPost);
router.get("/test", testController.testGet);
router.get("/users", userController.userGet);
router.post("/users", userController.userPost);
router.get("/workers", workerController.workerGet);
router.post("/workers", workerController.workerPost);

// Utils routes
router.get("/utils/handleValidation", (req, res) => {
  // Handler for /utils/handleValidation route
});

export default router;

import express from "express";
import { controller } from "../controllers/controller";
import { reportController } from "../controllers/report.controller";
import { scheduleController } from "../controllers/schedule.controller";
import { terminationController } from "../controllers/termination.controller";
import { testController } from "../controllers/test.controller";
import { userController } from "../controllers/user.controller";
import { vacationController } from "../controllers/vacation.controller";
import { workerController } from "../controllers/workers.controller";

const router = express.Router();

// Admin routes
router.post("/admin", controller.createAdmin);

// Detail-report routes
router.get("/detail-report/:id", controller.detailReportPut);

// Incidents routes

router.post("/incidents", controller.incidentPost);
router.get("/incidents", controller.incidentGet);
router.get("/incidents/:id", controller.incidentGetId);
router.put("/incidents/:id", controller.incidentPutId);

// Permissions routes
router.get("/permissions", controller.permissionPost);

// Report-dynamic routes
router.post("/report-dynamic", (req, res) => {
  // Handler for /report-dynamic route
});

// Reports routes
router.get("/reports", reportController.reportGet);
router.post("/reports", reportController.reportPost);
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

router.post("/reports/incident", reportController.reportIncidentPost);
router.get("/reports/incident/:id", reportController.reportIncidentIdGet);
router.delete("/reports/incident/:id", reportController.reportIncidentIdDelete);

router.post("/reports/upload", reportController.reportUploadPost);

router.post("/reports/upload-update", reportController.reportUploadUpdatePost);
router.post("/reports/weekly", reportController.reportWeeklyPost);

// Schedule routes
router.post("/schedule", scheduleController.schedulePost);
router.post(
  "/schedule/massive-schedule",
  scheduleController.scheduleMassiveSchedulePost
);
router.get("/schedule/type", scheduleController.scheduleTypeGet);
router.post("/schedule/type", scheduleController.scheduleTypePost);

router.put("/schedule/type/:id", scheduleController.scheduleTypeIdPut);

router.get("/schedule/worker/:id", scheduleController.scheduleWorkerIdGet);

// Terminations routes
router.get("/terminations", terminationController.terminationsGet);
router.post("/terminations", terminationController.terminationsPost);
router.put("/terminations/:id", terminationController.terminationIdPut);

// Test routes
router.get("/test", testController.testGet);
router.post("/test/:day", testController.testDayPost);

// Users routes
router.get("/users", userController.userGet);
router.post("/users", userController.userPost);
router.post("/users/file", userController.userPost);

router.get("/users/:id", userController.userIdGet);
router.put("/users/:id", userController.userIdPut);
router.delete("/users/:id", userController.userIdDelete);

// Utils routes
router.get("/utils/handleValidation", (req, res) => {
  // Handler for /utils/handleValidation route
});

// Vacations routes
router.post("/vacations", vacationController.vacationPost);

// W-access-data routes
router.get("/w-access-data/:token", (req, res) => {
  // Handler for /w-access-data/:token route
});

// Workers routes

router.get("/workers/departments", workerController.workerDepartmentsGet);

router.get("/workers", workerController.workerGet);
router.post("/workers", workerController.workerPost);

router.get("/workers/:id", workerController.workerIdGet);
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
router.get("/workers/schedule", workerController.workerScheduleGet);
router.post(
  "/workers/supervisor/file",
  workerController.workerSupervisorFilePost
);
router.get("/workers/supervisor", workerController.workerSupervisorGet);

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

export default router;

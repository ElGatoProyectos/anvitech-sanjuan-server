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
exports.dataService = void 0;
const anviz_service_1 = require("./anviz.service");
const errors_service_1 = require("./errors.service");
const report_service_1 = require("./report.service");
const response_service_1 = require("./response.service");
const worker_service_1 = require("./worker.service");
const schedule_service_1 = require("./schedule.service");
const prisma_1 = __importDefault(require("../prisma"));
const workers_constant_1 = require("../constants/workers.constant");
class DataService {
    instanceDataInit(minDay_1, maxDay_1, selectedYear_1, selectedMonth_1) {
        return __awaiter(this, arguments, void 0, function* (minDay, maxDay, selectedYear, selectedMonth, isReport = true) {
            try {
                /// obtener fecha y hora actual
                const { monday, saturday } = yield this.getMondayAndSaturday();
                const { year: dataYear, month: dataMonth } = yield this.getDate();
                const min = minDay !== null && minDay !== void 0 ? minDay : monday;
                const max = maxDay !== null && maxDay !== void 0 ? maxDay : saturday;
                const year = selectedYear !== null && selectedYear !== void 0 ? selectedYear : dataYear;
                const month = selectedMonth !== null && selectedMonth !== void 0 ? selectedMonth : dataMonth;
                console.log(min, max, year, month);
                /// obtener el token para hacer la peticion post
                const responseToken = yield anviz_service_1.anvizService.getToken();
                if (!responseToken.ok)
                    return responseToken;
                if (isReport) {
                    const responseReport = yield report_service_1.reportService.generateReport();
                    if (!responseReport.ok)
                        return responseReport;
                    const responseDetail = yield this.instanceDetailData(responseToken.content.token, Number(min), Number(max), Number(year), Number(month), responseReport.content);
                    yield prisma_1.default.$disconnect();
                    return response_service_1.httpResponse.http200("Report generado satisfactoriamente", responseDetail === null || responseDetail === void 0 ? void 0 : responseDetail.content);
                }
                else {
                    const responseDetail = yield this.instanceDetailDataNoRegister(responseToken.content.token, Number(min), Number(max), Number(year), Number(month));
                    yield prisma_1.default.$disconnect();
                    return response_service_1.httpResponse.http200("Report generado satisfactoriamente", responseDetail.content);
                }
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    instanceDetailData(token, minDay, maxDay, selectedYear, selectedMonth, report) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const days = [
                    "lunes",
                    "martes",
                    "miercoles",
                    "jueves",
                    "viernes",
                    "sabado",
                    "domingo",
                ];
                const promises = [];
                const { content: workerCount } = yield worker_service_1.workerService.findAll();
                let dynamicWorkerCount = workerCount.length;
                const responseDataForDay = yield this.captureDataForDay(token, minDay, selectedMonth, selectedYear);
                for (let day = minDay; day <= maxDay; day++) {
                    const dayString = this.functionCaptureDayFromNumber(day, selectedYear, selectedMonth);
                    const workers = yield worker_service_1.workerService.findAll();
                    yield prisma_1.default.$disconnect();
                    const processedWorknos = new Set();
                    console.log(responseDataForDay.content.length);
                    const dayPromises = yield responseDataForDay.content.map((row) => __awaiter(this, void 0, void 0, function* () {
                        const workno = row.employee.workno;
                        if (processedWorknos.has(workno)) {
                            return;
                        }
                        processedWorknos.add(workno);
                        const rowState = responseDataForDay.content.filter((item) => item.employee.workno === workno);
                        const worker = yield worker_service_1.workerService.findByDNI(workno);
                        if (worker.ok) {
                            yield this.newMethodRegisterReport(worker.content, rowState, dayString, report, day, selectedMonth, selectedYear);
                        }
                        else {
                            dynamicWorkerCount++;
                            if (dynamicWorkerCount > workers_constant_1.maxWorkers)
                                return;
                            const newWorker = {
                                full_name: row.employee.first_name + " " + row.employee.last_name,
                                dni: workno,
                                department: row.employee.department,
                                position: row.employee.job_title,
                            };
                            const responseNewWorker = yield worker_service_1.workerService.createNoHireDate(newWorker);
                            // validamos si llego al maximo
                            if (!responseNewWorker.ok)
                                return response_service_1.httpResponse.http400();
                            else {
                                // Incremento del contador
                                yield schedule_service_1.scheduleService.createScheduleDefault(responseNewWorker.content.id);
                                yield this.newMethodRegisterReport(responseNewWorker.content, rowState, dayString, report, day, selectedMonth, selectedYear);
                            }
                        }
                    }));
                    // nuevo
                    const newWorkers = yield worker_service_1.workerService.findAllNoDisable();
                    yield prisma_1.default.$disconnect();
                    const workersDniPending = [];
                    for (const worker of newWorkers.content) {
                        if (!processedWorknos.has(worker.dni)) {
                            workersDniPending.push(worker);
                        }
                    }
                    const dayPromises2 = workersDniPending.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield this.newMethodRegisterReport(item, [], dayString, report, day, selectedMonth, selectedYear);
                    }));
                    promises.push(Promise.allSettled(dayPromises));
                    //termina nuevo
                    promises.push(Promise.allSettled(dayPromises2));
                }
                yield Promise.allSettled(promises.flat()).then(() => {
                    return response_service_1.httpResponse.http200("report executed");
                });
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    newMethodRegisterReport(worker, dataDayForWorker, dayString, report, dayI, monthI, yearI) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //- traemos el horario ====================================================
                let schedule;
                const responseSchedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.id);
                if (!responseSchedule.ok) {
                    yield schedule_service_1.scheduleService.createScheduleDefault(worker.id);
                    const response = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.id);
                    schedule = response.content;
                }
                else {
                    schedule = responseSchedule.content;
                }
                //- definimos las horas del horario ====================================================
                const [lunesStart, lunesEnd] = schedule.lunes.split("-");
                // ! corregir esto
                // const [lunesStart, lunesEnd] = "09:00-18:00".split("-");
                const [hourStart, minutesStart] = lunesStart.split(":").map(Number);
                const [hourEnd, minutesEnd] = lunesEnd.split(":").map(Number);
                const formatData = {
                    report_id: report.id,
                    tardanza: "no",
                    falta: "no",
                    dia: dayString,
                    fecha_reporte: new Date(yearI, monthI - 1, dayI),
                    worker_status: worker.enabled,
                    dni: worker.dni,
                    nombre: worker.full_name,
                    supervisor: worker.supervisor,
                    sede: worker.department,
                    hora_entrada: "",
                    hora_inicio: "",
                    hora_inicio_refrigerio: "",
                    hora_fin_refrigerio: "",
                    hora_salida: "",
                    discount: 0,
                };
                //- creamos la fecha de reporte ====================================================
                const dateI = new Date(yearI, monthI - 1, dayI);
                formatData.fecha_reporte = dateI;
                if (dataDayForWorker.length) {
                    //! formatData.sede=dataFiltered[0].device.name,
                    dataDayForWorker.map((item, index) => {
                        const horaCompleta = item.checktime.split("T")[1].split("+")[0];
                        const [hour, minutes] = horaCompleta.split(":");
                        let newHour = Number(hour) - 5;
                        console.log("su horas es:", hourStart, hourEnd);
                        if (Number(hour) >= 0 && Number(hour) <= 4) {
                            newHour = 23 - 4 + Number(hour);
                        }
                        if (newHour <= 11) {
                            //-todo aqui agregue el if para validar la hora de inicio
                            if (formatData.hora_inicio === "") {
                                formatData.hora_inicio = newHour + ":" + minutes;
                                if (newHour > Number(hourStart)) {
                                    // si es mas que las 9 am o sea 10 am
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (newHour === Number(hourStart)) {
                                        if (Number(minutes) <= minutesStart) {
                                            formatData.tardanza = "no";
                                        }
                                        else {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                        formatData.falta = "no";
                                        formatData.discount = 0;
                                    }
                                }
                            }
                        }
                        // else if (newHour >= 12 && newHour <= 16) {
                        //   if (formatData.hora_inicio_refrigerio === "") {
                        //     formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
                        //   } else {
                        //     formatData.hora_fin_refrigerio = newHour + ":" + minutes;
                        //   }
                        // }
                        else {
                            if (newHour >= Number(hourEnd)) {
                                formatData.falta = "no";
                            }
                            else {
                                // formatData.falta = "si";
                                // formatData.tardanza = "no";
                                formatData.discount = 35;
                            }
                            formatData.hora_salida = newHour + ":" + minutes;
                        }
                    });
                }
                // ========================================================= caso de vacaciones y permisos =============================================================
                const dateYesterday = new Date();
                dateYesterday.setDate(dateYesterday.getDate() - 2);
                const datePost = new Date();
                datePost.setDate(datePost.getDate() + 1);
                //nuevo
                dateYesterday.setHours(0, 0, 0, 0);
                datePost.setHours(0, 0, 0, 0);
                //- validamos si esta de vacaciones, permiso, licencia o descanso medico
                // validamos las vacaciones
                const vacationResponse = yield prisma_1.default.vacation.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: datePost,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los permisos
                const permissionResponse = yield prisma_1.default.permissions.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos licencias
                const licencesResponse = yield prisma_1.default.licence.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los descansos medicos
                const medicalRestResponse = yield prisma_1.default.medicalRest.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos incidencias
                const newDateForIncident = new Date(dateYesterday);
                newDateForIncident.setDate(newDateForIncident.getDate() + 1);
                const incidentResponse = yield prisma_1.default.incident.findMany({
                    where: {
                        date: {
                            lte: datePost,
                            gte: dateYesterday,
                        },
                    },
                });
                if (dataDayForWorker.length < 2) {
                    formatData.falta = "si";
                    // formatData.tardanza = "no";
                    formatData.discount = 35;
                }
                if (vacationResponse.length > 0 ||
                    permissionResponse.length > 0 ||
                    licencesResponse.length > 0 ||
                    medicalRestResponse.length > 0 ||
                    incidentResponse.length > 0) {
                    formatData.falta = "no";
                    formatData.tardanza = "no";
                    formatData.discount = 0;
                }
                yield prisma_1.default.detailReport.create({ data: formatData });
                yield prisma_1.default.$disconnect();
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    newMethodRegisterReportNoRegister(worker, dataDayForWorker, dayString, report, dayI, monthI, yearI) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //- traemos el horario ====================================================
                const responseSchedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.id);
                const schedule = responseSchedule.content;
                //- definimos las horas del horario ====================================================
                const [lunesStart, lunesEnd] = schedule.lunes.split("-");
                const [hourStart, minutesStart] = lunesStart.split(":").map(Number);
                const [hourEnd, minutesEnd] = lunesEnd.split(":").map(Number);
                const formatData = {
                    report_id: report.id,
                    tardanza: "no",
                    falta: "no",
                    dia: dayString,
                    // fecha_reporte: report.date_created.toISOString(),?
                    fecha_reporte: new Date(yearI, monthI - 1, dayI),
                    worker_status: worker.enabled,
                    dni: worker.dni,
                    nombre: worker.full_name,
                    supervisor: worker.supervisor,
                    sede: worker.department,
                    hora_entrada: "",
                    hora_inicio: "",
                    hora_inicio_refrigerio: "",
                    hora_fin_refrigerio: "",
                    hora_salida: "",
                    discount: 0,
                };
                //- creamos la fecha de reporte ====================================================
                const dateI = new Date(yearI, monthI - 1, dayI);
                formatData.fecha_reporte = dateI;
                if (dataDayForWorker.length) {
                    //! formatData.sede=dataFiltered[0].device.name,
                    dataDayForWorker.map((item, index) => {
                        const horaCompleta = item.checktime.split("T")[1].split("+")[0];
                        const [hour, minutes] = horaCompleta.split(":");
                        let newHour = Number(hour) - 5;
                        if (Number(hour) >= 0 && Number(hour) <= 4) {
                            newHour = 23 - 4 + Number(hour);
                        }
                        if (newHour <= 11) {
                            //-todo aqui agregue el if para validar la hora de inicio
                            if (formatData.hora_inicio === "") {
                                formatData.hora_inicio = newHour + ":" + minutes;
                                if (newHour > Number(hourStart)) {
                                    // si es mas que las 9 am o sea 10 am
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (newHour === Number(hourStart)) {
                                        if (Number(minutes) <= minutesStart) {
                                            formatData.tardanza = "no";
                                        }
                                        else {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                        formatData.falta = "no";
                                        formatData.discount = 0;
                                    }
                                }
                            }
                        }
                        // else if (newHour >= 12 && newHour <= 16) {
                        //   if (formatData.hora_inicio_refrigerio === "") {
                        //     formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
                        //   } else {
                        //     formatData.hora_fin_refrigerio = newHour + ":" + minutes;
                        //   }
                        // }
                        else {
                            if (newHour >= Number(hourEnd)) {
                                formatData.falta = "no";
                            }
                            else {
                                // formatData.falta = "si";
                                // formatData.tardanza = "no";
                                formatData.discount = 35;
                            }
                            formatData.hora_salida = newHour + ":" + minutes;
                        }
                    });
                }
                // ========================================================= caso de vacaciones y permisos =============================================================
                const dateYesterday = new Date();
                dateYesterday.setDate(dateYesterday.getDate() - 1);
                //- validamos si esta de vacaciones, permiso, licencia o descanso medico
                // validamos las vacaciones
                const vacationResponse = yield prisma_1.default.vacation.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los permisos
                const permissionResponse = yield prisma_1.default.permissions.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos licencias
                const licencesResponse = yield prisma_1.default.licence.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los descansos medicos
                const medicalRestResponse = yield prisma_1.default.medicalRest.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos incidencias
                const incidentResponse = yield prisma_1.default.incident.findMany({
                    where: {
                        date: dateYesterday,
                    },
                });
                if (dataDayForWorker.length < 2) {
                    formatData.falta = "si";
                    // formatData.tardanza = "no";
                    formatData.discount = 35;
                }
                if (vacationResponse.length > 0 ||
                    permissionResponse.length > 0 ||
                    licencesResponse.length > 0 ||
                    medicalRestResponse.length > 0 ||
                    incidentResponse.length > 0) {
                    formatData.falta = "no";
                    formatData.tardanza = "no";
                    formatData.discount = 0;
                }
                return formatData;
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                console.log(error);
            }
        });
    }
    filterAndRegisterForUser(dataGeneralDay, worker, day, report, dayI, monthI, yearI) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /// con este horario validamos las horas, ya tenemos el day
                const responseSchedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.id);
                const schedule = responseSchedule.content;
                const [lunesStart, lunesEnd] = schedule.lunes.split("-");
                const [hourStart, minutesStart] = lunesStart.split(":");
                const [hourEnd, minutesEnd] = lunesEnd.split(":");
                //-devuelve un array de posiblemente 4 objetos que contienen la fecha de inicio a fin
                const dataFiltered = dataGeneralDay.filter((item) => item.employee.workno === worker.dni);
                const formatData = {
                    report_id: report.id,
                    tardanza: "no",
                    falta: "no",
                    dia: day,
                    // fecha_reporte: report.date_created.toISOString(),?
                    fecha_reporte: new Date(yearI, monthI - 1, dayI),
                    worker_status: worker.enabled,
                    dni: worker.dni,
                    nombre: worker.full_name,
                    supervisor: worker.supervisor,
                    sede: worker.department,
                    hora_entrada: "",
                    hora_inicio: "",
                    hora_inicio_refrigerio: "",
                    hora_fin_refrigerio: "",
                    hora_salida: "",
                    discount: 0,
                };
                //- aqui vamos a crear la fecha
                const dateI = new Date(yearI, monthI - 1, dayI);
                formatData.fecha_reporte = dateI;
                // caso normal ==========================================================================================
                if (dataFiltered.length) {
                    //! formatData.sede=dataFiltered[0].device.name,
                    dataFiltered.map((item, index) => {
                        const horaCompleta = item.checktime.split("T")[1].split("+")[0];
                        // if (!horaCompleta) {
                        //   formatData.falta = "si";
                        //   formatData.discount = 35;
                        // } quitamos porque no tiene sentido, las pueden haber horas vacias
                        const [hour, minutes] = horaCompleta.split(":");
                        let newHour = Number(hour) - 5;
                        if (Number(hour) >= 0 && Number(hour) <= 4) {
                            newHour = 23 - 4 + Number(hour);
                        }
                        // if (index === dataFiltered.length - 1) {
                        //   if (newHour < 16) {
                        //     formatData.falta = "si";
                        //     formatData.discount = 35;
                        //   }
                        // }
                        if (newHour <= 11) {
                            //-todo aqui agregue el if para validar la hora de inicio
                            if (formatData.hora_inicio === "") {
                                formatData.hora_inicio = newHour + ":" + minutes;
                                if (newHour > Number(hourStart)) {
                                    // si es mas que las 9 am o sea 10 am
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (newHour === Number(hourStart)) {
                                        if (Number(minutes) <= minutesStart) {
                                            formatData.tardanza = "no";
                                        }
                                        else {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                        formatData.falta = "no";
                                        formatData.discount = 0;
                                    }
                                }
                            }
                        }
                        else {
                            if (newHour >= Number(hourEnd)) {
                                formatData.falta = "no";
                            }
                            else {
                                formatData.falta = "si";
                                formatData.tardanza = "no";
                                formatData.discount = 35;
                            }
                            formatData.hora_salida = newHour + ":" + minutes;
                        }
                    });
                    // ========================================================= caso de vacaciones y permisos =============================================================
                }
                const dateYesterday = new Date();
                dateYesterday.setDate(dateYesterday.getDate() - 1);
                //- validamos si esta de vacaciones, permiso, licencia o descanso medico
                // validamos las vacaciones
                const vacationResponse = yield prisma_1.default.vacation.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los permisos
                const permissionResponse = yield prisma_1.default.permissions.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos licencias
                const licencesResponse = yield prisma_1.default.licence.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los descansos medicos
                const medicalRestResponse = yield prisma_1.default.medicalRest.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos incidencias
                const incidentResponse = yield prisma_1.default.incident.findMany({
                    where: {
                        date: dateYesterday,
                    },
                });
                if (vacationResponse.length > 0 ||
                    permissionResponse.length > 0 ||
                    licencesResponse.length > 0 ||
                    medicalRestResponse.length > 0 ||
                    incidentResponse.length > 0) {
                    formatData.falta = "no";
                    formatData.tardanza = "no";
                    formatData.discount = 0;
                }
                else {
                    formatData.falta = "si";
                    formatData.discount = 35;
                }
                yield prisma_1.default.detailReport.create({ data: formatData });
                yield prisma_1.default.$disconnect();
                /// no se cuantos objetos haya dentro del array, pero se que tengo que ordenarlos en base a la fecha
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    ///===========================================================================================================================
    /// métodos no affect database
    ///===========================================================================================================================
    functionCaptureDayFromNumber(day, year, month) {
        const date = new Date(year, month - 1, day);
        const dayOfWeekNumber = date.getDay();
        const daysOfWeek = [
            "domingo",
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
            "domingo",
        ];
        const dayOfWeekName = daysOfWeek[dayOfWeekNumber];
        return dayOfWeekName;
    }
    instanceDetailDataNoRegister(token, minDay, maxDay, selectedYear, selectedMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalData = [];
                for (let day = minDay; day <= maxDay; day++) {
                    const dayString = this.functionCaptureDayFromNumber(day, selectedYear, selectedMonth);
                    const responseDataForDay = yield this.captureDataForDay(token, day, selectedMonth, selectedYear);
                    // const processedWorknos = new Set<string>();
                    // const reportForDay = await Promise.all(
                    //   responseDataForDay.content.map(async (row: any) => {
                    //     const workno = row.employee.workno;
                    //     if (processedWorknos.has(workno)) {
                    //       return; // Si ya ha sido procesado, salta este ciclo
                    //     }
                    //     processedWorknos.add(workno);
                    //     const rowState = responseDataForDay.content.filter(
                    //       (item: any) => item.employee.workno === workno
                    //     );
                    //     const worker = await workerService.findByDNI(workno);
                    //     if (worker.ok) {
                    //       const response = await this.newMethodRegisterReportNoRegister(
                    //         worker.content,
                    //         rowState,
                    //         dayString,
                    //         "",
                    //         minDay,
                    //         selectedMonth,
                    //         selectedYear
                    //       );
                    //       return response;
                    //     } else {
                    //       const newWorker = {
                    //         dni: row.employee.workno,
                    //         full_name:
                    //           row.employee.first_name + " " + row.employee.last_name,
                    //         enabled: "si",
                    //         department: row.employee.department,
                    //       };
                    //       const response = await this.newMethodRegisterReportNoRegister(
                    //         newWorker,
                    //         rowState,
                    //         dayString,
                    //         "",
                    //         minDay,
                    //         selectedMonth,
                    //         selectedYear
                    //       );
                    //       return response;
                    //     }
                    //   })
                    // );
                    const workers = yield worker_service_1.workerService.findAll();
                    const reportForDay = yield Promise.all(workers.content.map((worker) => __awaiter(this, void 0, void 0, function* () {
                        const resFormat = yield this.filterAndRegisterForUserNoRegister(responseDataForDay.content, worker, dayString);
                        return resFormat;
                    })));
                    totalData.push(...reportForDay);
                }
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Report created", totalData);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    filterAndRegisterForUserNoRegister(dataGeneralDay, worker, day) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limaTime = new Date().toLocaleString("en-US", {
                    timeZone: "America/Lima",
                });
                const limaDate = new Date(limaTime);
                const dateToString = limaDate.toISOString();
                /// con este horario validamos las horas, ya tenemos el day
                const responseSchedule = yield schedule_service_1.scheduleService.findScheduleForWorker(worker.id);
                const schedule = responseSchedule.content;
                ///devuelve un array de posiblemente 4 objetos que contienen la fecha de inicio a fin
                const dataFiltered = dataGeneralDay.filter((item) => item.employee.workno === worker.dni);
                const formatData = {
                    report_id: "",
                    tardanza: "no",
                    falta: "si",
                    dia: day,
                    fecha_reporte: dateToString,
                    dni: worker.dni,
                    nombre: worker.full_name,
                    // sede: dataFiltered[0].device.name,
                    sede: worker.department,
                    supervisor: worker.supervisor,
                    hora_entrada: "",
                    hora_inicio: "",
                    hora_inicio_refrigerio: "",
                    hora_fin_refrigerio: "",
                    hora_salida: "",
                    discount: 35,
                    worker_status: worker.enabled,
                };
                if (dataFiltered.length) {
                    const [lunesStart, lunesEnd] = schedule.lunes.split("-");
                    const [hourStart, hourEnd] = lunesStart.split(":");
                    /// dataFiltered
                    if (dataFiltered.length) {
                        //! formatData.sede=dataFiltered[0].device.name,
                        dataFiltered.map((item, index) => {
                            const horaCompleta = item.checktime.split("T")[1].split("+")[0];
                            const [hour, minutes] = horaCompleta.split(":");
                            let newHour = Number(hour) - 5;
                            if (Number(hour) >= 0 && Number(hour) <= 4) {
                                newHour = 23 - 4 + Number(hour);
                            }
                            if (newHour <= 11) {
                                formatData.hora_inicio = newHour + ":" + minutes;
                                if (newHour > Number(hourStart)) {
                                    formatData.tardanza = "si";
                                    formatData.discount = 35;
                                }
                                else {
                                    if (newHour === 9) {
                                        if (Number(minutes) <= 5) {
                                            formatData.tardanza = "no";
                                        }
                                        else if (Number(minutes) > 5 && Number(minutes) <= 15) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 5;
                                        }
                                        else if (Number(minutes) > 15 && Number(minutes) <= 30) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 10;
                                        }
                                        else if (Number(minutes) > 30 && Number(minutes) <= 59) {
                                            formatData.tardanza = "si";
                                            formatData.discount = 20;
                                        }
                                    }
                                    else {
                                        formatData.tardanza = "no";
                                    }
                                }
                            }
                            else if (newHour >= 12 && newHour <= 16) {
                                if (formatData.hora_inicio_refrigerio === "") {
                                    formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
                                }
                                else {
                                    formatData.hora_fin_refrigerio = newHour + ":" + minutes;
                                }
                            }
                            else {
                                if (newHour >= Number(hourEnd)) {
                                    formatData.falta = "no";
                                }
                                else {
                                    formatData.falta = "si";
                                    formatData.tardanza = "no";
                                    formatData.discount = 35;
                                }
                                formatData.hora_salida = newHour + ":" + minutes;
                            }
                        });
                    }
                }
                const dateYesterday = new Date();
                //- validamos si esta de vacaciones o permiso
                // validamos las vacaciones
                const vacationResponse = yield prisma_1.default.vacation.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                // validamos los permisos
                const permissionResponse = yield prisma_1.default.permissions.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                const licencesResponse = yield prisma_1.default.licence.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                const medicalRestResponse = yield prisma_1.default.medicalRest.findMany({
                    where: {
                        worker_id: worker.id,
                        AND: [
                            {
                                start_date: {
                                    lte: dateYesterday,
                                },
                            },
                            {
                                end_date: {
                                    gte: dateYesterday,
                                },
                            },
                        ],
                    },
                });
                const incidentResponse = yield prisma_1.default.incident.findMany({
                    where: {
                        date: dateYesterday,
                    },
                });
                if (vacationResponse.length > 0 ||
                    permissionResponse.length > 0 ||
                    licencesResponse.length > 0 ||
                    medicalRestResponse.length > 0 ||
                    incidentResponse.length > 0) {
                    formatData.falta = "no";
                    formatData.tardanza = "no";
                    formatData.discount = 0;
                }
                else {
                    formatData.falta = "si";
                    formatData.discount = 35;
                }
                if (dataFiltered.length < 4) {
                    formatData.falta = "si";
                    formatData.tardanza = "no";
                    formatData.discount = 35;
                }
                yield prisma_1.default.$disconnect();
                return formatData;
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    captureDataForDay(token, day, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const begin_time = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T05:00:00+00:00`;
                let endDate = new Date(year, month - 1, day + 1, 5, 0, 0);
                let end_time;
                if (endDate.getDate() === 1) {
                    const newMonth = month === 12 ? 1 : month + 1;
                    const newYear = month === 12 ? year + 1 : year;
                    end_time = `${newYear}-${String(newMonth).padStart(2, "0")}-01T05:00:00+00:00`;
                }
                else {
                    end_time = `${year}-${String(month).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}T05:00:00+00:00`;
                }
                let dataList = [];
                let pos = 1;
                while (true) {
                    const response = yield anviz_service_1.anvizService.getData(token, begin_time, end_time, "asc", pos);
                    if (response.content.payload.list.length) {
                        dataList.push(...response.content.payload.list);
                        pos++;
                    }
                    else {
                        break;
                    }
                }
                yield prisma_1.default.$disconnect();
                return response_service_1.httpResponse.http200("Data for day", dataList);
            }
            catch (error) {
                yield prisma_1.default.$disconnect();
                return errors_service_1.errorService.handleErrorSchema(error);
            }
        });
    }
    getDate() {
        return __awaiter(this, void 0, void 0, function* () {
            const limaTime = new Date().toLocaleString("en-US", {
                timeZone: "America/Lima",
            });
            const limaDate = new Date(limaTime);
            const day = limaDate.getDate();
            const month = limaDate.getMonth() + 1;
            const year = limaDate.getFullYear();
            return { day, month, year };
        });
    }
    getMondayAndSaturday() {
        return __awaiter(this, void 0, void 0, function* () {
            const limaTime = new Date().toLocaleString("en-US", {
                timeZone: "America/Lima",
            });
            const limaDate = new Date(limaTime);
            const dayOfWeek = limaDate.getDay();
            const monday = new Date(limaDate);
            monday.setDate(limaDate.getDate() - ((dayOfWeek + 6) % 7));
            const saturday = new Date(limaDate);
            saturday.setDate(limaDate.getDate() + (6 - dayOfWeek));
            return {
                monday: monday.getDate(),
                saturday: saturday.getDate(),
            };
        });
    }
    getMondayAndSaturdayDatetime(day, month, year) {
        // Crear una fecha a partir de los datos proporcionados
        const inputDate = new Date(year, month - 1, day); // Los meses en JavaScript son 0-indexados
        const dayOfWeek = inputDate.getDay();
        // Calcular el lunes de esa semana
        const monday = new Date(inputDate);
        monday.setDate(inputDate.getDate() - ((dayOfWeek + 6) % 7));
        // Calcular el sábado de esa semana
        const saturday = new Date(inputDate);
        saturday.setDate(inputDate.getDate() + (6 - dayOfWeek));
        return {
            monday: monday.toISOString(),
            saturday: saturday.toISOString(),
        };
    }
    getDaysBetweenMondayAndSaturday(day, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputDate = new Date(year, month - 1, day);
            const dayOfWeek = inputDate.getDay();
            const monday = new Date(inputDate);
            monday.setDate(inputDate.getDate() - ((dayOfWeek + 6) % 7));
            const saturday = new Date(inputDate);
            saturday.setDate(inputDate.getDate() + (6 - dayOfWeek));
            const daysBetween = [];
            for (let d = new Date(monday); d <= saturday; d.setDate(d.getDate() + 1)) {
                daysBetween.push(new Date(d).toISOString());
            }
            return daysBetween;
        });
    }
    getDaysFromLastSaturdayToThisFriday(day, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputDate = new Date(year, month - 1, day);
            const dayOfWeek = inputDate.getDay();
            // Encontrar el sábado anterior
            const lastSaturday = new Date(inputDate);
            lastSaturday.setDate(inputDate.getDate() - dayOfWeek - 1);
            // Encontrar el viernes actual
            const thisFriday = new Date(inputDate);
            thisFriday.setDate(inputDate.getDate() + (5 - dayOfWeek));
            // Generar todas las fechas entre el sábado anterior y el viernes actual
            const daysBetween = [];
            for (let d = new Date(lastSaturday); d <= thisFriday; d.setDate(d.getDate() + 1)) {
                daysBetween.push(new Date(d).toISOString());
            }
            return daysBetween;
        });
    }
}
exports.dataService = new DataService();

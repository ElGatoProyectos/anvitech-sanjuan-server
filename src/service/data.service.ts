import { anvizService } from "./anviz.service";
import { errorService } from "./errors.service";
import { reportService } from "./report.service";
import { httpResponse } from "./response.service";
import { workerService } from "./worker.service";
import { formatDateForPrisma } from "../functions/date-transform";
import { scheduleService } from "./schedule.service";
import { vacationService } from "./vacation.service";
import prisma from "../prisma";

class DataService {
  async instanceDataInit(
    minDay?: number,
    maxDay?: number,
    selectedYear?: number,
    selectedMonth?: number,
    isReport: boolean = true
  ) {
    try {
      /// obtener fecha y hora actual
      const { monday, saturday } = await this.getMondayAndSaturday();
      const { year: dataYear, month: dataMonth } = await this.getDate();

      const min = minDay ?? monday;
      const max = maxDay ?? saturday;
      const year = selectedYear ?? dataYear;
      const month = selectedMonth ?? dataMonth;

      console.log(min, max, year, month);

      /// obtener el token para hacer la peticion post

      const responseToken = await anvizService.getToken();

      if (!responseToken.ok) return responseToken;

      if (isReport) {
        const responseReport = await reportService.generateReport();

        if (!responseReport.ok) return responseReport;

        const responseDetail = await this.instanceDetailData(
          responseToken.content.token,
          Number(min),
          Number(max),
          Number(year),
          Number(month),
          responseReport.content
        );

        await prisma.$disconnect();

        return httpResponse.http200(
          "Report generado satisfactoriamente",
          responseDetail?.content
        );
      } else {
        const responseDetail = await this.instanceDetailDataNoRegister(
          responseToken.content.token,
          Number(min),
          Number(max),
          Number(year),
          Number(month)
        );

        await prisma.$disconnect();

        return httpResponse.http200(
          "Report generado satisfactoriamente",
          responseDetail.content
        );
      }
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  /// falta otro metodo igual que no registre, solo que muestre

  // async instanceDetailData(
  //   token: string,
  //   minDay: number,
  //   maxDay: number,
  //   selectedYear: number,
  //   selectedMonth: number,
  //   report: any
  // ) {
  //   try {
  //     const days = [
  //       "lunes",
  //       "martes",
  //       "miercoles",
  //       "jueves",
  //       "viernes",
  //       "sabado",
  //       "domingo",
  //     ];

  //     let pos = 0;

  //     for (let day = minDay; day <= maxDay; day++) {
  //       /// definimos el dia donde estamos para poder hacer el registro a la bd 📅
  //       const dayString = this.functionCaptureDayFromNumber(
  //         day,
  //         selectedYear,
  //         selectedMonth
  //       );

  //       ///capturamos toda la data por dia de toda las paginas  [{},{},{}....{}]
  //       // todo todo ok
  //       const responseDataForDay = await this.captureDataForDay(
  //         token,
  //         day,
  //         selectedMonth,
  //         selectedYear
  //       );

  //       /// filtrar la data para que se registre por usuario
  //       const workers = await workerService.findAll();
  //       await prisma.$disconnect();

  //       /// iteración de trabajadores para obtener sus datos y analizar en base a eso
  //       /// antes de pasar a esto deberia haber un filtro de validar si el registro.dni existe en la base de datos, si no existe, hacemos otro proceso que registre al trabajador en la bd y luego el reporte

  //       const processedWorknos = new Set<string>();

  //       await Promise.all(
  //         responseDataForDay.content.map(async (row: any) => {
  //           const workno = row.employee.workno;

  //           // Verifica si el workno ya ha sido procesado

  //           // Marca este workno como procesado
  //           if (processedWorknos.has(workno)) {
  //             return; // Si ya ha sido procesado, salta este ciclo
  //           }
  //           processedWorknos.add(workno);

  //           const rowState = responseDataForDay.content.filter(
  //             (item: any) => item.employee.workno === workno
  //           );

  //           // Validar que el trabajador cuyos registros ya se evaluaron, no se vuelva a repetir en otro bucle
  //           const worker = await workerService.findByDNI(workno);
  //           if (worker.ok) {
  //             // Validamos la data con respecto al trabajador
  //             await this.newMethodRegisterReport(
  //               worker.content,
  //               rowState,
  //               dayString,
  //               report,
  //               day,
  //               selectedMonth,
  //               selectedYear
  //             );
  //           } else {
  //             // Registramos al trabajador
  //             const newWorker = {
  //               full_name:
  //                 row.employee.first_name + " " + row.employee.last_name, // Corrige el nombre completo concatenando first_name y last_name
  //               dni: workno,
  //               department: row.employee.department,
  //               position: row.employee.job_title,
  //             };

  //             const responseNewWorker = await workerService.createNoHireDate(
  //               newWorker
  //             );

  //             await scheduleService.createScheduleDefault(
  //               responseNewWorker.content.id
  //             );
  //             await this.newMethodRegisterReport(
  //               responseNewWorker.content,
  //               rowState,
  //               dayString,
  //               report,
  //               day,
  //               selectedMonth,
  //               selectedYear
  //             );
  //           }
  //         })
  //       );
  //       // anterior --- eliminado
  //       // const responseMap = workers.content.map(async (worker: any) => {
  //       //   await this.filterAndRegisterForUser(
  //       //     responseDataForDay.content,
  //       //     worker,
  //       //     dayString,
  //       //     report,
  //       //     day,
  //       //     selectedMonth,
  //       //     selectedYear
  //       //   );
  //       // });

  //       pos++;
  //     }

  //     await prisma.$disconnect();

  //     return httpResponse.http200("Report created", "Report created");
  //   } catch (error) {
  //     await prisma.$disconnect();
  //     return errorService.handleErrorSchema(error);
  //   }
  // }

  async instanceDetailData(
    token: string,
    minDay: number,
    maxDay: number,
    selectedYear: number,
    selectedMonth: number,
    report: any
  ) {
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

      const responseDataForDay = await this.captureDataForDay(
        token,
        minDay,
        selectedMonth,
        selectedYear
      );

      for (let day = minDay; day <= maxDay; day++) {
        const dayString = this.functionCaptureDayFromNumber(
          day,
          selectedYear,
          selectedMonth
        );

        const workers = await workerService.findAll();
        await prisma.$disconnect();

        const processedWorknos = new Set();

        const dayPromises = responseDataForDay.content.map(async (row: any) => {
          const workno = row.employee.workno;
          if (processedWorknos.has(workno)) {
            return;
          }
          processedWorknos.add(workno);

          const rowState = responseDataForDay.content.filter(
            (item: any) => item.employee.workno === workno
          );

          const worker = await workerService.findByDNI(workno);
          if (worker.ok) {
            await this.newMethodRegisterReport(
              worker.content,
              rowState,
              dayString,
              report,
              day,
              selectedMonth,
              selectedYear
            );
          } else {
            const newWorker = {
              full_name: row.employee.first_name + " " + row.employee.last_name,
              dni: workno,
              department: row.employee.department,
              position: row.employee.job_title,
            };
            const responseNewWorker = await workerService.createNoHireDate(
              newWorker
            );

            // validamos si llego al maximo

            if (!responseNewWorker.ok) return;

            await scheduleService.createScheduleDefault(
              responseNewWorker.content.id
            );
            await this.newMethodRegisterReport(
              responseNewWorker.content,
              rowState,
              dayString,
              report,
              day,
              selectedMonth,
              selectedYear
            );
          }
        });

        // nuevo

        const newWorkers = await workerService.findAllNoDisable();
        await prisma.$disconnect();

        const workersDniPending = [];

        for (const worker of newWorkers.content) {
          if (!processedWorknos.has(worker.dni)) {
            workersDniPending.push(worker);
          }
        }

        const dayPromises2 = workersDniPending.map(async (item: any) => {
          await this.newMethodRegisterReport(
            item,
            [],
            dayString,
            report,
            day,
            selectedMonth,
            selectedYear
          );
        });

        promises.push(Promise.allSettled(dayPromises));
        //termina nuevo
        promises.push(Promise.allSettled(dayPromises2));
      }

      Promise.allSettled(promises.flat()).then(() => {
        return httpResponse.http200("report executed");
      });
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async newMethodRegisterReport(
    worker: any,
    dataDayForWorker: any[],
    dayString: string,
    report: any,
    dayI: number,
    monthI: number,
    yearI: number
  ) {
    try {
      //- traemos el horario ====================================================

      let schedule;
      const responseSchedule = await scheduleService.findScheduleForWorker(
        worker.id
      );

      if (!responseSchedule.ok) {
        await scheduleService.createScheduleDefault(worker.id);

        const response = await scheduleService.findScheduleForWorker(worker.id);
        schedule = response.content;
      } else {
        schedule = responseSchedule.content;
      }

      //- definimos las horas del horario ====================================================

      const [lunesStart, lunesEnd] = schedule.lunes.split("-");
      // ! corregir esto
      // const [lunesStart, lunesEnd] = "09:00-18:00".split("-");

      const [hourStart, minutesStart] = lunesStart.split(":");
      const [hourEnd, minutesEnd] = lunesEnd.split(":");

      const formatData: any = {
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

          let newHour: number = Number(hour) - 5;

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
              } else {
                if (newHour === 9) {
                  if (Number(minutes) <= 5) {
                    formatData.tardanza = "no";
                  } else if (Number(minutes) > 5 && Number(minutes) <= 15) {
                    formatData.tardanza = "si";
                    formatData.discount = 5;
                  } else if (Number(minutes) > 15 && Number(minutes) <= 30) {
                    formatData.tardanza = "si";
                    formatData.discount = 10;
                  } else if (Number(minutes) > 30 && Number(minutes) <= 59) {
                    formatData.tardanza = "si";
                    formatData.discount = 20;
                  }
                } else {
                  formatData.tardanza = "no";
                  formatData.falta = "no";
                  formatData.discount = 0;
                }
              }
            }
          } else if (newHour >= 12 && newHour <= 16) {
            if (formatData.hora_inicio_refrigerio === "") {
              formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
            } else {
              formatData.hora_fin_refrigerio = newHour + ":" + minutes;
            }
          } else {
            if (newHour >= Number(hourEnd)) {
              formatData.falta = "no";
            } else {
              formatData.falta = "si";
              formatData.tardanza = "no";
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

      const vacationResponse = await prisma.vacation.findMany({
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

      const permissionResponse = await prisma.permissions.findMany({
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

      const licencesResponse = await prisma.licence.findMany({
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

      const medicalRestResponse = await prisma.medicalRest.findMany({
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

      const incidentResponse = await prisma.incident.findMany({
        where: {
          date: {
            lte: datePost,
            gte: dateYesterday,
          },
        },
      });

      if (dataDayForWorker.length < 4) {
        formatData.falta = "si";
        formatData.tardanza = "no";
        formatData.discount = 35;
      }

      if (
        vacationResponse.length > 0 ||
        permissionResponse.length > 0 ||
        licencesResponse.length > 0 ||
        medicalRestResponse.length > 0 ||
        incidentResponse.length > 0
      ) {
        formatData.falta = "no";
        formatData.tardanza = "no";
        formatData.discount = 0;
      }

      await prisma.detailReport.create({ data: formatData });
      await prisma.$disconnect();
    } catch (error) {
      console.log(error);
    }
  }

  async newMethodRegisterReportNoRegister(
    worker: any,
    dataDayForWorker: any[],
    dayString: string,
    report: any,
    dayI: number,
    monthI: number,
    yearI: number
  ) {
    try {
      //- traemos el horario ====================================================
      const responseSchedule = await scheduleService.findScheduleForWorker(
        worker.id
      );
      const schedule = responseSchedule.content;
      //- definimos las horas del horario ====================================================

      const [lunesStart, lunesEnd] = schedule.lunes.split("-");
      const [hourStart, minutesStart] = lunesStart.split(":");
      const [hourEnd, minutesEnd] = lunesEnd.split(":");

      const formatData: any = {
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

          let newHour: number = Number(hour) - 5;

          if (Number(hour) >= 0 && Number(hour) <= 4) {
            newHour = 23 - 4 + Number(hour);
          }

          if (newHour <= 11) {
            if (formatData.hora_inicio === "") {
              formatData.hora_inicio = newHour + ":" + minutes;
              if (newHour > Number(hourStart)) {
                // si es mas que las 9 am o sea 10 am
                formatData.tardanza = "si";
                formatData.discount = 35;
              } else {
                if (newHour === 9) {
                  if (Number(minutes) <= 5) {
                    formatData.tardanza = "no";
                  } else if (Number(minutes) > 5 && Number(minutes) <= 15) {
                    formatData.tardanza = "si";
                    formatData.discount = 5;
                  } else if (Number(minutes) > 15 && Number(minutes) <= 30) {
                    formatData.tardanza = "si";
                    formatData.discount = 10;
                  } else if (Number(minutes) > 30 && Number(minutes) <= 59) {
                    formatData.tardanza = "si";
                    formatData.discount = 20;
                  }
                } else {
                  formatData.tardanza = "no";
                  formatData.falta = "no";
                  formatData.discount = 0;
                }
              }
            }
          } else if (newHour >= 12 && newHour <= 16) {
            if (formatData.hora_inicio_refrigerio === "") {
              formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
            } else {
              formatData.hora_fin_refrigerio = newHour + ":" + minutes;
            }
          } else {
            if (newHour >= Number(hourEnd)) {
              formatData.falta = "no";
            } else {
              formatData.falta = "si";
              formatData.tardanza = "no";
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

      const vacationResponse = await prisma.vacation.findMany({
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

      const permissionResponse = await prisma.permissions.findMany({
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

      const licencesResponse = await prisma.licence.findMany({
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

      const medicalRestResponse = await prisma.medicalRest.findMany({
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

      const incidentResponse = await prisma.incident.findMany({
        where: {
          date: dateYesterday,
        },
      });

      if (dataDayForWorker.length < 4) {
        formatData.falta = "si";
        formatData.tardanza = "no";
        formatData.discount = 35;
      }

      if (
        vacationResponse.length > 0 ||
        permissionResponse.length > 0 ||
        licencesResponse.length > 0 ||
        medicalRestResponse.length > 0 ||
        incidentResponse.length > 0
      ) {
        formatData.falta = "no";
        formatData.tardanza = "no";
        formatData.discount = 0;
      }

      return formatData;
    } catch (error) {
      await prisma.$disconnect();
      console.log(error);
    }
  }

  async filterAndRegisterForUser(
    dataGeneralDay: any[],
    worker: any,
    day: string,
    report: any,
    dayI: number,
    monthI: number,
    yearI: number
  ) {
    try {
      /// con este horario validamos las horas, ya tenemos el day
      const responseSchedule = await scheduleService.findScheduleForWorker(
        worker.id
      );
      const schedule = responseSchedule.content;

      const [lunesStart, lunesEnd] = schedule.lunes.split("-");
      const [hourStart, minutesStart] = lunesStart.split(":");
      const [hourEnd, minutesEnd] = lunesEnd.split(":");

      //-devuelve un array de posiblemente 4 objetos que contienen la fecha de inicio a fin
      const dataFiltered = dataGeneralDay.filter(
        (item) => item.employee.workno === worker.dni
      );

      const formatData: any = {
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

          let newHour: number = Number(hour) - 5;

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
            formatData.hora_inicio = newHour + ":" + minutes;
            if (newHour > Number(hourStart)) {
              formatData.tardanza = "si";
              formatData.discount = 35;
            } else {
              if (newHour === 9) {
                if (Number(minutes) <= 5) {
                  formatData.tardanza = "no";
                } else if (Number(minutes) > 5 && Number(minutes) <= 15) {
                  formatData.tardanza = "si";
                  formatData.discount = 5;
                } else if (Number(minutes) > 15 && Number(minutes) <= 30) {
                  formatData.tardanza = "si";
                  formatData.discount = 10;
                } else if (Number(minutes) > 30 && Number(minutes) <= 59) {
                  formatData.tardanza = "si";
                  formatData.discount = 20;
                }
              } else {
                formatData.tardanza = "no";
              }
            }
          } else if (newHour >= 12 && newHour <= 16) {
            if (formatData.hora_inicio_refrigerio === "") {
              formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
            } else {
              formatData.hora_fin_refrigerio = newHour + ":" + minutes;
            }
          } else {
            if (newHour >= Number(hourEnd)) {
              formatData.falta = "no";
            } else {
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

      const vacationResponse = await prisma.vacation.findMany({
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

      const permissionResponse = await prisma.permissions.findMany({
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

      const licencesResponse = await prisma.licence.findMany({
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

      const medicalRestResponse = await prisma.medicalRest.findMany({
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

      const incidentResponse = await prisma.incident.findMany({
        where: {
          date: dateYesterday,
        },
      });

      if (
        vacationResponse.length > 0 ||
        permissionResponse.length > 0 ||
        licencesResponse.length > 0 ||
        medicalRestResponse.length > 0 ||
        incidentResponse.length > 0
      ) {
        formatData.falta = "no";
        formatData.tardanza = "no";
        formatData.discount = 0;
      } else {
        formatData.falta = "si";
        formatData.discount = 35;
      }

      await prisma.detailReport.create({ data: formatData });
      await prisma.$disconnect();

      /// no se cuantos objetos haya dentro del array, pero se que tengo que ordenarlos en base a la fecha
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  ///===========================================================================================================================
  /// métodos no affect database
  ///===========================================================================================================================

  functionCaptureDayFromNumber(day: number, year: number, month: number) {
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

  async instanceDetailDataNoRegister(
    token: string,
    minDay: number,
    maxDay: number,
    selectedYear: number,
    selectedMonth: number
  ) {
    try {
      const totalData = [];

      for (let day = minDay; day <= maxDay; day++) {
        const dayString = this.functionCaptureDayFromNumber(
          day,
          selectedYear,
          selectedMonth
        );

        const responseDataForDay = await this.captureDataForDay(
          token,
          day,
          selectedMonth,
          selectedYear
        );

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

        const workers = await workerService.findAll();

        const reportForDay = await Promise.all(
          workers.content.map(async (worker: any) => {
            const resFormat = await this.filterAndRegisterForUserNoRegister(
              responseDataForDay.content,
              worker,
              dayString
            );
            return resFormat;
          })
        );

        totalData.push(...reportForDay);
      }

      await prisma.$disconnect();

      return httpResponse.http200("Report created", totalData);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async filterAndRegisterForUserNoRegister(
    dataGeneralDay: any[],
    worker: any,
    day: string
  ) {
    try {
      const limaTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Lima",
      });

      const limaDate = new Date(limaTime);

      const dateToString = limaDate.toISOString();

      /// con este horario validamos las horas, ya tenemos el day
      const responseSchedule = await scheduleService.findScheduleForWorker(
        worker.id
      );
      const schedule = responseSchedule.content;

      ///devuelve un array de posiblemente 4 objetos que contienen la fecha de inicio a fin
      const dataFiltered = dataGeneralDay.filter(
        (item) => item.employee.workno === worker.dni
      );

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

            let newHour: number = Number(hour) - 5;

            if (Number(hour) >= 0 && Number(hour) <= 4) {
              newHour = 23 - 4 + Number(hour);
            }

            if (newHour <= 11) {
              formatData.hora_inicio = newHour + ":" + minutes;
              if (newHour > Number(hourStart)) {
                formatData.tardanza = "si";
                formatData.discount = 35;
              } else {
                if (newHour === 9) {
                  if (Number(minutes) <= 5) {
                    formatData.tardanza = "no";
                  } else if (Number(minutes) > 5 && Number(minutes) <= 15) {
                    formatData.tardanza = "si";
                    formatData.discount = 5;
                  } else if (Number(minutes) > 15 && Number(minutes) <= 30) {
                    formatData.tardanza = "si";
                    formatData.discount = 10;
                  } else if (Number(minutes) > 30 && Number(minutes) <= 59) {
                    formatData.tardanza = "si";
                    formatData.discount = 20;
                  }
                } else {
                  formatData.tardanza = "no";
                }
              }
            } else if (newHour >= 12 && newHour <= 16) {
              if (formatData.hora_inicio_refrigerio === "") {
                formatData.hora_inicio_refrigerio = newHour + ":" + minutes;
              } else {
                formatData.hora_fin_refrigerio = newHour + ":" + minutes;
              }
            } else {
              if (newHour >= Number(hourEnd)) {
                formatData.falta = "no";
              } else {
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

      const vacationResponse = await prisma.vacation.findMany({
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

      const permissionResponse = await prisma.permissions.findMany({
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

      const licencesResponse = await prisma.licence.findMany({
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

      const medicalRestResponse = await prisma.medicalRest.findMany({
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

      const incidentResponse = await prisma.incident.findMany({
        where: {
          date: dateYesterday,
        },
      });

      if (
        vacationResponse.length > 0 ||
        permissionResponse.length > 0 ||
        licencesResponse.length > 0 ||
        medicalRestResponse.length > 0 ||
        incidentResponse.length > 0
      ) {
        formatData.falta = "no";
        formatData.tardanza = "no";
        formatData.discount = 0;
      } else {
        formatData.falta = "si";
        formatData.discount = 35;
      }

      if (dataFiltered.length < 4) {
        formatData.falta = "si";
        formatData.tardanza = "no";
        formatData.discount = 35;
      }

      await prisma.$disconnect();
      return formatData;
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async captureDataForDay(
    token: string,
    day: number,
    month: number,
    year: number
  ) {
    try {
      const begin_time = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}T05:00:00+00:00`;

      let endDate = new Date(year, month - 1, day + 1, 5, 0, 0);

      let end_time;
      if (endDate.getDate() === 1) {
        const newMonth = month === 12 ? 1 : month + 1;
        const newYear = month === 12 ? year + 1 : year;
        end_time = `${newYear}-${String(newMonth).padStart(
          2,
          "0"
        )}-01T05:00:00+00:00`;
      } else {
        end_time = `${year}-${String(month).padStart(2, "0")}-${String(
          day + 1
        ).padStart(2, "0")}T05:00:00+00:00`;
      }

      let dataList = [];
      let pos = 1;
      while (true) {
        const response = await anvizService.getData(
          token,
          begin_time,
          end_time,
          "asc",
          pos
        );
        if (response.content.payload.list.length) {
          dataList.push(...response.content.payload.list);
          pos++;
        } else {
          break;
        }
      }

      await prisma.$disconnect();

      return httpResponse.http200("Data for day", dataList);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  private async getDate() {
    const limaTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Lima",
    });

    const limaDate = new Date(limaTime);

    const day = limaDate.getDate();
    const month = limaDate.getMonth() + 1;
    const year = limaDate.getFullYear();

    return { day, month, year };
  }

  async getMondayAndSaturday() {
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
  }

  getMondayAndSaturdayDatetime(day: number, month: number, year: number) {
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

  async getDaysBetweenMondayAndSaturday(
    day: number,
    month: number,
    year: number
  ) {
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
  }

  async getDaysFromLastSaturdayToThisFriday(
    day: number,
    month: number,
    year: number
  ) {
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

    for (
      let d = new Date(lastSaturday);
      d <= thisFriday;
      d.setDate(d.getDate() + 1)
    ) {
      daysBetween.push(new Date(d).toISOString());
    }

    return daysBetween;
  }
}

export const dataService = new DataService();

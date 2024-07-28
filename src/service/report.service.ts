import { errorService } from "./errors.service";
import { httpResponse } from "./response.service";

import * as xlsx from "xlsx";
import { dataService } from "./data.service";
import { workerService } from "./worker.service";
import { incidentService } from "./incident.service";
import { scheduleService } from "./schedule.service";
import prisma from "../prisma";

class ReportService {
  async generateReport() {
    try {
      const lastReport = (await this.findLast()) as any;
      let numberPos;
      if (lastReport !== null) {
        const nameSepare = lastReport.name.split(" ");
        numberPos = Number(nameSepare[1]) + 1;
      } else numberPos = 1;

      const dataSet = {
        state: "default",
        name: "Report " + numberPos,
      };
      const report = await prisma.report.create({ data: dataSet });
      await prisma.$disconnect();

      return httpResponse.http200("Report created ok", report);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async generateReportDetail(dataGeneralAniz: any[], reportId: number) {
    // todo mapeo de la informacion y registro de la misma en base al id del reporte
  }

  async findAll() {
    try {
      const reports = await prisma.report.findMany();
      await prisma.$disconnect();

      return httpResponse.http200("All reports", reports);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async generateReportForWorker(data: any, dni: string) {
    try {
      const worker = await prisma.worker.findFirst({ where: { dni } });
      if (!worker) return httpResponse.http404("worker not found");

      const { start, end } = data;
      const start_date_prev = new Date(start);
      start_date_prev.setDate(start_date_prev.getDate());

      const end_date_prev = new Date(end);
      end_date_prev.setDate(end_date_prev.getDate() + 1);

      // Buscar registros en el rango de fechas
      const report = await prisma.detailReport.findMany({
        where: {
          dni,
          fecha_reporte: {
            gte: start_date_prev,
            lte: end_date_prev,
          },
        },
      });
      return httpResponse.http200("Report", { report, worker });
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  async findById(reportId: number) {
    try {
      const detail = await prisma.report.findFirst({ where: { id: reportId } });
      if (!detail) return httpResponse.http404("Report not found");
      await prisma.$disconnect();

      return httpResponse.http200("Report found", detail);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  private async findLast() {
    const data = await prisma.report.findFirst({
      orderBy: {
        id: "desc",
      },
    });
    await prisma.$disconnect();

    return data;
  }

  /// not used
  async findDetailReport(id: number) {
    try {
      const details = await prisma.detailReport.findMany({
        where: { report_id: id },
      });
      await prisma.$disconnect();

      return httpResponse.http200("All details report", details);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findReportByWorker(reportId: number, workerDNI: string) {
    try {
      const detail = await prisma.detailReport.findMany({
        where: { report_id: reportId, dni: workerDNI },
      });
      await prisma.$disconnect();

      return httpResponse.http200("All details report", detail);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  /// ok
  async updateHours(detailReportId: number, dataHours: any) {
    try {
      const updated = await prisma.detailReport.update({
        where: { id: detailReportId },
        data: {
          hora_inicio: { set: dataHours.hora_inicio },
          hora_inicio_refrigerio: { set: dataHours.hora_inicio_refrigerio },
          hora_fin_refrigerio: { set: dataHours.hora_fin_refrigerio },
          hora_salida: { set: dataHours.hora_salida },
        },
      });
      await prisma.$disconnect();

      return httpResponse.http200("Detail updated", updated);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async addIncident(detailReportId: number, incidentId: number) {
    try {
      // modifica la tardanza y falta porque esta justificado
      await prisma.detailReport.update({
        where: { id: detailReportId },
        data: { tardanza: "no", falta: "no" },
      });
      await prisma.$disconnect();

      const updated = await prisma.detailReportIncident.create({
        data: {
          detail_report_id: detailReportId,
          incident_id: incidentId,
        },
      });
      await prisma.$disconnect();

      return httpResponse.http201("Incident created", updated);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async deleteIncident(detailId: number) {
    try {
      // tenemos que validar si el trabajador tiene tardanza o falta
      const reporseDetail = await prisma.detailReportIncident.findFirst({
        where: { id: detailId },
      });
      await prisma.$disconnect();

      await prisma.detailReport.update({
        where: { id: reporseDetail?.detail_report_id },
        data: { falta: "si" },
      });
      await prisma.$disconnect();

      const deleted = await prisma.detailReportIncident.delete({
        where: { id: detailId },
      });

      await prisma.$disconnect();

      return httpResponse.http201("Incident detail deleted", deleted);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async findIncidentsForDetail(detailId: number) {
    try {
      const incidents = await prisma.detailReportIncident.findMany({
        where: { detail_report_id: detailId },
        include: {
          incident: true,
        },
      });
      await prisma.$disconnect();

      return httpResponse.http200("All incidents for detail", incidents);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  //ok
  getMondayAndSaturdayDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    const endDate = new Date(now);

    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMonday);

    const diffToSaturday = 6 - dayOfWeek;
    endDate.setDate(endDate.getDate() + diffToSaturday);

    return {
      monday: startDate,
      saturday: endDate,
    };
  }

  getMondayAndSaturdayDatesWParmas(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number); // YYYY-MM-DD format
    const inputDate = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid timezone issues

    const dayOfWeek = inputDate.getUTCDay(); // Use getUTCDay() for consistency

    const startDate = new Date(inputDate);
    const endDate = new Date(inputDate);

    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    startDate.setUTCDate(startDate.getUTCDate() + diffToMonday); // Use setUTCDate

    const diffToSaturday = 6 - dayOfWeek;
    endDate.setUTCDate(endDate.getUTCDate() + diffToSaturday); // Use setUTCDate

    return {
      startDate,
      endDate,
    };
  }

  //ok
  async dataForStartSoft(month: number, year: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const detailReports = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      await prisma.$disconnect();

      const responseWorkers = await workerService.findAll();
      await prisma.$disconnect();

      const dataGeneral = await Promise.all(
        await responseWorkers.content.map(async (worker: any) => {
          const responseVacations = await prisma.vacation.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responsePermission = await prisma.permissions.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseMedicalRest = await prisma.medicalRest.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseLicenses = await prisma.licence.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseReports = await prisma.detailReport.findMany({
            where: {
              dni: worker.dni,
              AND: [
                {
                  fecha_reporte: {
                    lte: endDate,
                  },
                },
                {
                  fecha_reporte: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const formatData = {
            worker,
            reportes: responseReports,
            vacaciones: responseVacations,
            descansos_medico: responseMedicalRest,
            licencias: responseLicenses,
            permisos: responsePermission,
          };

          return formatData;
        })
      );

      const incidents = await prisma.incident.findMany({
        where: { date: { gte: startDate, lt: endDate } },
      });
      await prisma.$disconnect();

      return httpResponse.http200("Report success", dataGeneral);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // v2
  async newDataForStartSoft(month: number, year: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const responseWorkers = await workerService.findAll();
      await prisma.$disconnect();

      const dataGeneral = await Promise.all(
        await responseWorkers.content.map(async (worker: any) => {
          const schedule = await prisma.schedule.findFirst({
            where: { worker_id: worker.id },
          });

          const responseVacations = await prisma.vacation.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responsePermission = await prisma.permissions.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseMedicalRest = await prisma.medicalRest.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseLicenses = await prisma.licence.findMany({
            where: {
              worker_id: worker.id,
              AND: [
                {
                  start_date: {
                    lte: endDate,
                  },
                },
                {
                  end_date: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const responseReports = await prisma.detailReport.findMany({
            where: {
              dni: worker.dni,
              AND: [
                {
                  fecha_reporte: {
                    lte: endDate,
                  },
                },
                {
                  fecha_reporte: {
                    gte: startDate,
                  },
                },
              ],
            },
          });
          await prisma.$disconnect();

          const formatData = {
            worker,
            schedule,
            reportes: responseReports,
            vacaciones: responseVacations,
            descansos_medico: responseMedicalRest,
            licencias: responseLicenses,
            permisos: responsePermission,
          };

          return formatData;
        })
      );

      const incidents = await prisma.incident.findMany({
        where: { date: { gte: startDate, lt: endDate } },
      });
      await prisma.$disconnect();

      return httpResponse.http200("Report success", { dataGeneral, incidents });
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // v2
  async newFormatForWorker(workerSelected: any, dateSelected: any) {
    try {
      const { start, end } = dateSelected;

      const startDate = new Date(`${start}T00:00:00`);
      const endDate = new Date(`${end}T23:59:59`);

      const reports = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            gte: startDate,
            lt: endDate,
          },
          dni: workerSelected.dni,
        },
      });

      const schedule = await prisma.schedule.findFirst({
        where: { worker_id: workerSelected.id },
      });

      const responseVacations = await prisma.vacation.findMany({
        where: {
          worker_id: workerSelected.id,
          AND: [
            {
              start_date: {
                lte: endDate,
              },
            },
            {
              end_date: {
                gte: startDate,
              },
            },
          ],
        },
      });
      await prisma.$disconnect();

      const responsePermission = await prisma.permissions.findMany({
        where: {
          worker_id: workerSelected.id,
          AND: [
            {
              start_date: {
                lte: endDate,
              },
            },
            {
              end_date: {
                gte: startDate,
              },
            },
          ],
        },
      });
      await prisma.$disconnect();

      const responseMedicalRest = await prisma.medicalRest.findMany({
        where: {
          worker_id: workerSelected.id,
          AND: [
            {
              start_date: {
                lte: endDate,
              },
            },
            {
              end_date: {
                gte: startDate,
              },
            },
          ],
        },
      });
      await prisma.$disconnect();

      const responseLicenses = await prisma.licence.findMany({
        where: {
          worker_id: workerSelected.id,
          AND: [
            {
              start_date: {
                lte: endDate,
              },
            },
            {
              end_date: {
                gte: startDate,
              },
            },
          ],
        },
      });
      await prisma.$disconnect();

      const formatData = {
        reportes: reports,
        vacaciones: responseVacations,
        descansos_medico: responseMedicalRest,
        licencias: responseLicenses,
        permisos: responsePermission,
        schedule,
      };

      return httpResponse.http200("Report success", formatData);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // new
  async newModelForReport(dateSelected: any) {
    try {
      // console.log(dateSelected);
      const { startDate, endDate } =
        this.getMondayAndSaturdayDatesWParmas(dateSelected);

      const reports = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const data = await Promise.all(
        reports.map(async (item: any) => {
          const dni = item.dni;
          const worker = await workerService.findByDNI(dni);

          return {
            report: item,
            worker,
          };
        })
      );

      return httpResponse.http200("Report success", data);
    } catch (error) {
      return errorService.handleErrorSchema(error);
    }
  }

  // ok
  async dataForExportNormal(dateMin: Date, dateMax: Date) {
    try {
      const data = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            gte: dateMin,
            lte: dateMax,
          },
        },
      });
      await prisma.$disconnect();

      return httpResponse.http200("All data", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // busca todos los reportes no importa si el trabajador ya este inactivo o activo
  async generateReportForDayNoToday(day: number, month: number, year: number) {
    try {
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

      // End date at the beginning of the next day
      const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

      const data = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      await prisma.$disconnect();

      return httpResponse.http200("Report day created", data);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async generateReportForWeek(days: string[]) {
    try {
      const { content: workers } = await workerService.findAll();
      await prisma.$disconnect();

      // Obtener todos los reportes de una sola vez
      const reports = await prisma.detailReport.findMany({
        where: {
          fecha_reporte: {
            in: days,
          },
          dni: {
            in: workers.map((worker: any) => worker.dni),
          },
        },
      });

      await prisma.$disconnect();

      const response = workers.map((worker: any) => {
        const formatData: any = {
          worker,
          lunes: null,
          martes: null,
          miercoles: null,
          jueves: null,
          viernes: null,
          sabado: null,
          domingo: null,
        };

        // Filtrar y asignar los reportes correspondientes a cada día
        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const data = reports.find(
            (report: any) =>
              new Date(report.fecha_reporte).toISOString() === day &&
              report.dni === worker.dni
          );

          if (i === 0) formatData.sabado = data || null;
          else if (i === 1) formatData.domingo = data || null;
          else if (i === 2) formatData.lunes = data || null;
          else if (i === 3) formatData.martes = data || null;
          else if (i === 4) formatData.miercoles = data || null;
          else if (i === 5) formatData.jueves = data || null;
          else if (i === 6) formatData.viernes = data || null;
        }

        return formatData;
      });
      await prisma.$disconnect();
      return httpResponse.http200("Report weekly", response);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  // async generateReportForWeek(days: string[]) {
  //   try {
  //     const { content: workers } = await workerService.findAll();
  //     await prisma.$disconnect();

  //     const response = await Promise.all(
  //       workers.map(async (worker: any) => {
  //         const formatData = {
  //           worker,
  //           lunes: {},
  //           martes: {},
  //           miercoles: {},
  //           jueves: {},
  //           viernes: {},
  //           sabado: {},
  //           domingo: {},
  //         };

  //         for (let i = 0; i < days.length; i++) {
  //           const day = days[i];

  //           const data: any = await prisma.detailReport.findFirst({
  //             where: { fecha_reporte: day, dni: worker.dni },
  //           });
  //           await prisma.$disconnect();

  //           if (i === 0) formatData.sabado = data ? data : null;
  //           else if (i === 1) formatData.domingo = data ? data : null;
  //           else if (i === 2) formatData.lunes = data ? data : null;
  //           else if (i === 3) formatData.martes = data ? data : null;
  //           else if (i === 4) formatData.miercoles = data ? data : null;
  //           else if (i === 5) formatData.jueves = data ? data : null;
  //           else if (i === 6) formatData.viernes = data ? data : null;
  //         }

  //         return formatData;
  //       })
  //     );
  //     await prisma.$disconnect();

  //     return httpResponse.http200("Report weekly", response);
  //   } catch (error) {
  //     await prisma.$disconnect();
  //     return errorService.handleErrorSchema(error);
  //   }
  // }

  async updateDetailReport(data: any, detailReportId: number) {
    try {
      // capturamos el horario del trabajador

      const { dataTemporalHours, dataDetail } = data;

      const workerResponse = await workerService.findByDNI(dataDetail.dni);
      if (!workerResponse.ok) return workerResponse;

      const schedule = await prisma.schedule.findFirst({
        where: { worker_id: workerResponse.content.id },
      });

      await prisma.$disconnect();

      if (!schedule) return httpResponse.http400("Schedule not found");

      // ahora validamos ==========================================================================

      const hourTotal = schedule.lunes; // "09:00-18:00"
      const [hourStart, hourEnd] = hourTotal.split("-"); // ["09:00", "18:00"]

      const [scheduleStartHour, scheduStartMinute] = hourStart
        .split(":")
        .map(Number); // [9, 0]
      const [scheduleEndHour, scheduEndMinute] = hourEnd.split(":").map(Number); // [18, 0]

      const dataStart = dataTemporalHours.hora_inicio; // "09:00"
      const dataEnd = dataTemporalHours.hora_salida; // "18:00"

      const formatData = {
        hora_inicio: dataTemporalHours.hora_inicio,
        hora_inicio_refrigerio: dataTemporalHours.hora_inicio_refrigerio,
        hora_fin_refrigerio: dataTemporalHours.hora_fin_refrigerio,
        hora_salida: dataTemporalHours.hora_salida,
        tardanza: "no",
        falta: "no",
        discount: 0,
      };

      // cuando el usuario tiene una hora de entrada

      if (
        dataTemporalHours.hora_inicio !== "" &&
        dataTemporalHours.hora_salida === ""
      ) {
        const [dataStartHour, dataStartMinute] = dataTemporalHours.hora_inicio
          .split(":")
          .map(Number);

        // aqui cambie la falta por tardanza
        if (dataStartHour <= 11) {
          if (dataStartHour > scheduleStartHour) {
            formatData.tardanza = "si";

            formatData.discount = 35;
          } else {
            if (dataStartHour === scheduleStartHour) {
              if (Number(dataStartMinute) <= 5) {
                formatData.tardanza = "no";
              } else if (
                Number(dataStartMinute) > 5 &&
                Number(dataStartMinute) <= 15
              ) {
                formatData.tardanza = "si";
                formatData.discount = 5;
              } else if (
                Number(dataStartMinute) > 15 &&
                Number(dataStartMinute) <= 30
              ) {
                formatData.tardanza = "si";
                formatData.discount = 10;
              } else if (
                Number(dataStartMinute) > 30 &&
                Number(dataStartMinute) <= 59
              ) {
                formatData.tardanza = "si";
                formatData.discount = 20;
              }
            } else {
              formatData.tardanza = "no";
            }
          }
          formatData.falta = "no";
        }
        formatData.falta = "si";
        formatData.discount = 35;
      }
      // cuando el usuario tiene una hora de salida
      else if (
        dataTemporalHours.hora_inicio === "" &&
        dataTemporalHours.hora_salida !== ""
      ) {
        const [dataEndHour, dataEndMinute] = dataTemporalHours.hora_salida
          .split(":")
          .map(Number);

        if (dataEndHour < scheduleEndHour) {
          formatData.falta = "si";
          formatData.tardanza = "no";
        } else if (dataEndHour === scheduleEndHour) {
          if (dataTemporalHours.hora_inicio === "") {
            formatData.tardanza = "si";
            formatData.discount = 35;
          }
          formatData.falta = "no";
        }
      } else if (dataStart === "" && dataEnd === "") {
        formatData.falta = "si";
        formatData.tardanza = "no";
        formatData.discount = 35;
      } else {
        // ====================caso donde tienen hora_inicio y hora_fin ============================
        const [dataStartHour, dataStartMinute] = dataTemporalHours.hora_inicio
          .split(":")
          .map(Number);
        const [dataEndHour, dataEndMinute] = dataTemporalHours.hora_salida
          .split(":")
          .map(Number);

        if (dataStartHour <= 11) {
          if (dataStartHour > scheduleStartHour) {
            formatData.tardanza = "si";
            formatData.discount = 35;
          } else {
            if (dataStartHour === scheduleStartHour) {
              if (Number(dataStartMinute) <= 5) {
                formatData.tardanza = "no";
              } else if (
                Number(dataStartMinute) > 5 &&
                Number(dataStartMinute) <= 15
              ) {
                formatData.tardanza = "si";
                formatData.discount = 5;
              } else if (
                Number(dataStartMinute) > 15 &&
                Number(dataStartMinute) <= 30
              ) {
                formatData.tardanza = "si";
                formatData.discount = 10;
              } else if (
                Number(dataStartMinute) > 30 &&
                Number(dataStartMinute) <= 59
              ) {
                formatData.tardanza = "si";
                formatData.discount = 20;
              }
            } else {
              formatData.tardanza = "no";
            }
          }
          formatData.falta = "no";
        } else {
          formatData.tardanza = "si";
        }

        if (dataEndHour < scheduleEndHour) {
          formatData.falta = "si";
          formatData.tardanza = "no";
        } else if (dataEndHour === scheduleEndHour) {
          formatData.falta = "no";
        }
      }

      if (
        dataTemporalHours.hora_inicio_refrigerio === "" ||
        dataTemporalHours.hora_fin_refrigerio === ""
      ) {
        formatData.falta = "si";
        formatData.discount = 35;
      }

      const updated = await prisma.detailReport.update({
        where: { id: detailReportId },
        data: formatData,
      });
      await prisma.$disconnect();
      return httpResponse.http200("Detail report updated", updated);
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async uploadReportMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      const exampleData = sheetToJson[0];

      const report = await reportService.generateReport();

      await Promise.all(
        sheetToJson.map(async (row: any, index) => {
          const worker = await workerService.findByDNI(String(row.dni));
          const schedule = await scheduleService.findScheduleForWorker(
            worker.content.id
          );

          const [scheduleStart, scheduleEnd] =
            schedule.content[
              this.getDayOfWeek(new Date(row.fecha_reporte))
            ].split("-");
          const [scheduleHourStart, scheduleMinuteStart] = scheduleStart
            .split(":")
            .map(Number);

          const [scheduleHourEnd, scheduleMinuteEnd] = scheduleEnd
            .split(":")
            .map(Number);

          const formatData = {
            report_id: report.content.id,
            tardanza: "no",
            falta: "si",
            fecha_reporte: this.excelSerialDateToJSDate(row.fecha_reporte),
            dia: this.getDayOfWeek(
              this.excelSerialDateToJSDate(row.fecha_reporte)
            ),
            dni: String(row.dni),
            nombre: worker.content.full_name,
            sede: worker.content.department,
            hora_inicio: row.hora_inicio ? String(row.hora_inicio) : "",
            hora_inicio_refrigerio: row.hora_inicio_refrigerio
              ? String(row.hora_inicio_refrigerio)
              : "",
            hora_fin_refrigerio: row.hora_fin_refrigerio
              ? String(row.hora_fin_refrigerio)
              : "",
            hora_salida: row.hora_salida ? String(row.hora_salida) : "",
            discount: 0,
          };

          // cuando el usuario tiene registrado una hora de inicio ===============

          if (row.hora_inicio !== "" && row.hora_salida === "") {
            const [dataStartHour, dataStartMinute] = row.hora_inicio
              .split(":")
              .map(Number);

            if (dataStartHour <= 11) {
              if (dataStartHour > scheduleHourStart) {
                formatData.tardanza = "si";

                formatData.discount = 35;
              } else {
                if (dataStartHour === scheduleHourStart) {
                  if (Number(dataStartMinute) <= 5) {
                    formatData.tardanza = "no";
                  } else if (
                    Number(dataStartMinute) > 5 &&
                    Number(dataStartMinute) <= 15
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 5;
                  } else if (
                    Number(dataStartMinute) > 15 &&
                    Number(dataStartMinute) <= 30
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 10;
                  } else if (
                    Number(dataStartMinute) > 30 &&
                    Number(dataStartMinute) <= 59
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 20;
                  }
                } else {
                  formatData.tardanza = "no";
                }
              }
              formatData.falta = "no";
            }
            formatData.falta = "si";
            formatData.discount = 35;
          }
          // cuando el usuario tiene una hora de salida
          else if (row.hora_inicio === "" && row.hora_salida !== "") {
            const [dataEndHour, dataEndMinute] = row.hora_salida
              .split(":")
              .map(Number);

            if (dataEndHour < scheduleHourEnd) {
              formatData.falta = "si";
              formatData.tardanza = "no";
            } else if (dataEndHour === scheduleHourEnd) {
              if (row.hora_inicio === "") formatData.tardanza = "si";
              formatData.falta = "no";
            }
          } else if (row.hora_inicio === "" && row.hora_salida === "") {
            formatData.falta = "si";
            formatData.tardanza = "no";
          } else {
            const [dataStartHour, dataStartMinute] = String(row.hora_inicio)
              .split(":")
              .map(Number);
            const [dataEndHour, dataEndMinute] = String(row.hora_salida)
              .split(":")
              .map(Number);

            if (dataStartHour <= 11) {
              if (dataStartHour > scheduleHourStart) {
                formatData.tardanza = "si";

                formatData.discount = 35;
              } else {
                if (dataStartHour === scheduleHourStart) {
                  if (Number(dataStartMinute) <= 5) {
                    formatData.tardanza = "no";
                  } else if (
                    Number(dataStartMinute) > 5 &&
                    Number(dataStartMinute) <= 15
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 5;
                  } else if (
                    Number(dataStartMinute) > 15 &&
                    Number(dataStartMinute) <= 30
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 10;
                  } else if (
                    Number(dataStartMinute) > 30 &&
                    Number(dataStartMinute) <= 59
                  ) {
                    formatData.tardanza = "si";
                    formatData.discount = 20;
                  }
                } else {
                  formatData.tardanza = "no";
                }
              }
              formatData.falta = "no";
            } else {
              formatData.tardanza = "si";
            }
          }

          if (
            row.hora_inicio_refrigerio === "" ||
            row.hora_fin_refrigerio === ""
          ) {
            formatData.falta = "si";
            formatData.discount = 35;
          }

          //- validamos si esta en un fecha donde tiene una escusa para no asistir

          const responseValidateWorkerInDay = await this.validateDayInWorker(
            new Date(row.fecha_reporte),
            worker.content.id
          );

          if (responseValidateWorkerInDay) {
            formatData.falta = "no";
            formatData.tardanza = "no";
            formatData.discount = 0;
          }

          await prisma.detailReport.create({ data: formatData });
          await prisma.$disconnect();
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Ok", "Reports upload");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  async uploadUpdateReportMassive(file: any) {
    try {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      const buffer = file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetToJson = xlsx.utils.sheet_to_json(sheet);

      await Promise.all(
        sheetToJson.map(async (row: any, index) => {
          const worker = await workerService.findByDNI(String(row.dni));
          const schedule = await scheduleService.findScheduleForWorker(
            worker.content.id
          );

          const detail = await prisma.detailReport.findFirst({
            where: {
              dni: String(row.dni),
              dia: this.getDayOfWeek(
                this.excelSerialDateToJSDate(row.fecha_reporte)
              ),
            },
          });

          await prisma.$disconnect();

          const [scheduleStart, scheduleEnd] =
            schedule.content[
              this.getDayOfWeek(new Date(row.fecha_reporte))
            ].split("-");
          const [scheduleHourStart, scheduleMinuteStart] = scheduleStart
            .split(":")
            .map(Number);

          const [scheduleHourEnd, scheduleMinuteEnd] = scheduleEnd
            .split(":")
            .map(Number);

          const formatData = {
            report_id: detail?.report_id,
            tardanza: "no",
            falta: "si",
            fecha_reporte: this.excelSerialDateToJSDate(row.fecha_reporte),
            dia: this.getDayOfWeek(
              this.excelSerialDateToJSDate(row.fecha_reporte)
            ),
            dni: String(row.dni),
            nombre: worker.content.full_name,
            sede: worker.content.department,
            hora_inicio: row.hora_inicio ? String(row.hora_inicio) : "",
            hora_inicio_refrigerio: row.hora_inicio_refrigerio
              ? String(row.hora_inicio_refrigerio)
              : "",
            hora_fin_refrigerio: row.hora_fin_refrigerio
              ? String(row.hora_fin_refrigerio)
              : "",
            hora_salida: row.hora_salida ? String(row.hora_salida) : "",
            discount: 0,
          };

          // si hay un registro empezamos a condicionar los horarios =============================================
          if (detail) {
            if (row.hora_inicio !== "" && row.hora_salida === "") {
              const [dataStartHour, dataStartMinute] = row.hora_inicio
                .split(":")
                .map(Number);

              if (dataStartHour <= 11) {
                if (dataStartHour > scheduleHourStart) {
                  formatData.tardanza = "si";

                  formatData.discount = 35;
                } else {
                  if (dataStartHour === scheduleHourStart) {
                    if (Number(dataStartMinute) <= 5) {
                      formatData.tardanza = "no";
                    } else if (
                      Number(dataStartMinute) > 5 &&
                      Number(dataStartMinute) <= 15
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 5;
                    } else if (
                      Number(dataStartMinute) > 15 &&
                      Number(dataStartMinute) <= 30
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 10;
                    } else if (
                      Number(dataStartMinute) > 30 &&
                      Number(dataStartMinute) <= 59
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 20;
                    }
                  } else {
                    formatData.tardanza = "no";
                  }
                }
                formatData.falta = "no";
              }
              formatData.falta = "si";
              formatData.discount = 35;
            }
            // cuando el usuario tiene una hora de salida
            else if (row.hora_inicio === "" && row.hora_salida !== "") {
              const [dataEndHour, dataEndMinute] = row.hora_salida
                .split(":")
                .map(Number);

              if (dataEndHour < scheduleHourEnd) {
                formatData.falta = "si";
                formatData.tardanza = "no";
              } else if (dataEndHour === scheduleHourEnd) {
                if (row.hora_inicio === "") formatData.tardanza = "si";
                formatData.falta = "no";
              }
            } else if (row.hora_inicio === "" && row.hora_salida === "") {
              formatData.falta = "si";
              formatData.tardanza = "no";
            } else {
              const [dataStartHour, dataStartMinute] = String(row.hora_inicio)
                .split(":")
                .map(Number);
              const [dataEndHour, dataEndMinute] = String(row.hora_salida)
                .split(":")
                .map(Number);

              if (dataStartHour <= 11) {
                if (dataStartHour > scheduleHourStart) {
                  formatData.tardanza = "si";

                  formatData.discount = 35;
                } else {
                  if (dataStartHour === scheduleHourStart) {
                    if (Number(dataStartMinute) <= 5) {
                      formatData.tardanza = "no";
                    } else if (
                      Number(dataStartMinute) > 5 &&
                      Number(dataStartMinute) <= 15
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 5;
                    } else if (
                      Number(dataStartMinute) > 15 &&
                      Number(dataStartMinute) <= 30
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 10;
                    } else if (
                      Number(dataStartMinute) > 30 &&
                      Number(dataStartMinute) <= 59
                    ) {
                      formatData.tardanza = "si";
                      formatData.discount = 20;
                    }
                  } else {
                    formatData.tardanza = "no";
                  }
                }
                formatData.falta = "no";
              } else {
                formatData.tardanza = "si";
              }
            }
            if (
              row.hora_inicio_refrigerio === "" ||
              row.hora_fin_refrigerio === ""
            ) {
              formatData.falta = "si";
              formatData.discount = 35;
            }

            //- validamos si esta en un fecha donde tiene una escusa para no asistir
            const responseValidateWorkerInDay = await this.validateDayInWorker(
              new Date(row.fecha_reporte),
              worker.content.id
            );

            if (responseValidateWorkerInDay) {
              formatData.falta = "no";
              formatData.tardanza = "no";
              formatData.discount = 0;
            }

            const created = await prisma.detailReport.update({
              where: { id: detail.id },
              data: formatData,
            });
          }

          // si hay un registro empezamos a condicionar los horarios =============================================
        })
      );
      await prisma.$disconnect();
      return httpResponse.http200("Ok", "Reports upload");
    } catch (error) {
      await prisma.$disconnect();
      return errorService.handleErrorSchema(error);
    }
  }

  excelSerialDateToJSDate(serial: number): Date {
    const excelEpoch = new Date("1899-12-30"); // Fecha base de Excel
    const millisecondsInDay = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const offsetDays = Math.floor(serial); // Parte entera del número de serie

    // Calcular el número de milisegundos desde la fecha base
    const dateMilliseconds =
      excelEpoch.getTime() + offsetDays * millisecondsInDay;

    // Crear y devolver el objeto Date
    const date = new Date(dateMilliseconds);
    return date;
  }

  getDayOfWeek(date: Date): string {
    const daysOfWeek = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    const dayIndex = date.getDay() + 1;

    return daysOfWeek[dayIndex];
  }

  async validateDayInWorker(fecha_excel: Date, workerId: number) {
    // tenemos que transformar la fecha como en el data service
    // esto pendiente hasta que se presente el bug

    // const dateYesterday = new Date(fecha_excel);

    // dateYesterday.setDate(dateYesterday.getDate() - 1);

    // const datePost = new Date();
    // datePost.setDate(datePost.getDate());

    // dateYesterday.setHours(0, 0, 0, 0);
    // datePost.setHours(0, 0, 0, 0);
    // fecha_excel.setHours(0, 0, 0, 0);

    const incidentResponse = await prisma.incident.findMany({
      where: {
        date: fecha_excel,
      },
    });

    await prisma.$disconnect();

    const medicalRestResponse = await prisma.medicalRest.findMany({
      where: {
        worker_id: workerId,
        AND: [
          {
            start_date: {
              lte: fecha_excel,
            },
          },
          {
            end_date: {
              gte: fecha_excel,
            },
          },
        ],
      },
    });
    await prisma.$disconnect();

    const vacationResponse = await prisma.vacation.findMany({
      where: {
        worker_id: workerId,
        AND: [
          {
            start_date: {
              lte: fecha_excel,
            },
          },
          {
            end_date: {
              gte: fecha_excel,
            },
          },
        ],
      },
    });
    await prisma.$disconnect();

    // validamos los permisos

    const permissionResponse = await prisma.permissions.findMany({
      where: {
        worker_id: workerId,
        AND: [
          {
            start_date: {
              lte: fecha_excel,
            },
          },
          {
            end_date: {
              gte: fecha_excel,
            },
          },
        ],
      },
    });
    await prisma.$disconnect();

    const licencesResponse = await prisma.licence.findMany({
      where: {
        worker_id: workerId,
        AND: [
          {
            start_date: {
              lte: fecha_excel,
            },
          },
          {
            end_date: {
              gte: fecha_excel,
            },
          },
        ],
      },
    });

    await prisma.$disconnect();

    if (
      vacationResponse.length > 0 ||
      permissionResponse.length > 0 ||
      licencesResponse.length > 0 ||
      medicalRestResponse.length > 0 ||
      incidentResponse.length > 0
    )
      return true;
    return false;
  }
}

export const reportService = new ReportService();

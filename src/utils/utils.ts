import prisma from "../prisma";
import { dataService } from "../service/data.service";
import cron from "node-cron";

export function cronStart() {
  cron.schedule("*/58 * * * *", async () => {
    try {
      const limaTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Lima",
      });
      const limaDate = new Date(limaTime);
      const previousDayTimestamp = limaDate.getTime() - 24 * 60 * 60 * 1000;
      const previousDayDate = new Date(previousDayTimestamp);

      const dayOfWeek = limaDate.getDay();

      // solo evitaria si fuese lunes, porque si es lunes jalaria del domingo
      if (dayOfWeek !== 1) {
        const dayOfMonth = previousDayDate.getDate();
        const month = previousDayDate.getMonth() + 1;
        const year = previousDayDate.getFullYear();
        const currentHour = new Date(limaTime).getHours();

        // validamos si existen registros para esa fecha
        const newDateFormat = `${year} + "-" + ${month} + "-" + ${dayOfMonth} + " 05:00:00.000"`;

        if (currentHour === 5) {
          const response = await prisma.detailReport.findMany({
            where: { fecha_reporte: newDateFormat },
          });
          if (response.length === 0) {
            await dataService.instanceDataInit(
              dayOfMonth,
              dayOfMonth,
              year,
              month,
              true
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

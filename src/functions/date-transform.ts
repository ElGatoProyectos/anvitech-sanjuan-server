export function excelSerialDateToJSDate(serial: number) {
  const excelEpoch = new Date(1900, 0, 1);
  // const days = serial - 1; esto aumentaba supuestamente uno a la fecha
  const days = serial;

  return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
}

export function formatDateForPrisma(date: Date) {
  const newDate = new Date(date);
  return newDate.toISOString();
}
export function returnFormatDate(serial: number) {
  const date = excelSerialDateToJSDate(serial);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

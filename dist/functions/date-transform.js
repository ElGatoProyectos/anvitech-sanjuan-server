"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelSerialDateToJSDate = excelSerialDateToJSDate;
exports.formatDateForPrisma = formatDateForPrisma;
exports.returnFormatDate = returnFormatDate;
function excelSerialDateToJSDate(serial) {
    const excelEpoch = new Date(1900, 0, 1);
    // const days = serial - 1; esto aumentaba supuestamente uno a la fecha
    const days = serial;
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
}
function formatDateForPrisma(date) {
    const newDate = new Date(date);
    return newDate.toISOString();
}
function returnFormatDate(serial) {
    const date = excelSerialDateToJSDate(serial);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

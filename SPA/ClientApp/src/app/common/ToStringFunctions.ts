import * as moment from "moment";

const DateTimeFormat = "DD.MM.YYYY HH:mm:ss";
const DateFormat = "DD.MM.YYYY";
export const TimeFormat = "HH:mm";


export function formatDateTime(dateTimeIso: string): string {
    if (dateTimeIso == undefined) return '';
    return moment(dateTimeIso).format(DateTimeFormat)
}

export function formatDate(dateTimeIso: string): string {
    if (dateTimeIso == undefined) return '';
    return moment(dateTimeIso).format(DateFormat)
}
import { ApiError } from "./ApiError.js";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const dateStringToInt = (dateStr) => {
    if (!dateStr) {
        throw ApiError.badRequest("Date is required");
    }
    const [year, month, day] = dateStr.split("-");
    return Number(`${year}${month}${day}`);
};

export const dateIntToString = (dateInt) => {
    const s = String(dateInt);
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

export const timeStringToMinutes = (timeStr) => {
    if (!timeStr) {
        throw ApiError.badRequest("Time is required");
    }
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
};

export const minutesToTimeString = (minutes) => {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    return `${hour}:${minute}`;
};

export const toDbFormat = (payload) => {
    const data = { ...payload };

    if (payload.date !== undefined) data.date = dateStringToInt(payload.date);
    if (payload.startTime !== undefined) data.startTime = timeStringToMinutes(payload.startTime);
    if (payload.endTime !== undefined) {
        data.endTime = payload.endTime ? timeStringToMinutes(payload.endTime) : null;
    }

    return data;
};

export const toClientFormat = (task) => {
    return {
        ...task,
        date: dateIntToString(task.date),
        startTime: minutesToTimeString(task.startTime),
        endTime: task.endTime == null ? "" : minutesToTimeString(task.endTime),
    };
};
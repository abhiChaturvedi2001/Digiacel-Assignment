// Converters between the API format and the storage format.
//   API: date "YYYY-MM-DD", times "HH:mm" (endTime may be "")
//   DB:  date YYYYMMDD number, times as minutes since midnight (endTime may be null)
// Inputs are validated by the zod schemas before they reach these helpers.

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const dateStringToInt = (dateStr) => Number(dateStr.replaceAll("-", ""));

export const dateIntToString = (dateInt) => {
    const s = String(dateInt);
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

export const timeStringToMinutes = (timeStr) => {
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

export const toClientFormat = (task) => ({
    ...task,
    date: dateIntToString(task.date),
    startTime: minutesToTimeString(task.startTime),
    endTime: task.endTime == null ? "" : minutesToTimeString(task.endTime),
});

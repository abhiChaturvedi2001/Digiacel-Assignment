import { z } from "zod";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const PRIORITIES = ["low", "medium", "high", ""];
export const STATUSES = ["in_progress", "completed"];

// True only for real calendar days (rejects 2026-02-31, 2026-13-01, ...).
const isRealDate = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const dateField = (label) =>
    z
        .string({ error: `${label} is required` })
        .regex(DATE_RE, { error: `${label} must look like 2026-11-15` })
        .refine(isRealDate, { error: `${label} is not a valid calendar date` });

const timeField = (label) =>
    z.string({ error: `${label} is required` }).regex(TIME_RE, { error: `${label} must look like 09:30` });

// Unknown keys (_id, createdAt, ...) are stripped, so clients can only write these fields.
const taskBody = z
    .object({
        title: z
            .string({ error: "Title is required" })
            .trim()
            .min(1, { error: "Title is required" })
            .max(80, { error: "Title must be 80 characters or fewer" }),
        description: z
            .string()
            .trim()
            .max(1000, { error: "Description must be 1000 characters or fewer" })
            .default(""),
        date: dateField("Date"),
        startTime: timeField("Start time"),
        endTime: z.union([z.literal(""), timeField("End time")]).default(""),
        priority: z.enum(PRIORITIES, { error: "Priority must be low, medium or high" }).default(""),
        status: z.enum(STATUSES, { error: "Status must be in_progress or completed" }).default("in_progress"),
    })
    .refine((t) => !t.endTime || t.endTime > t.startTime, {
        error: "End time must be after the start time",
        path: ["endTime"],
    });

// POST creates a task; PUT replaces every editable field, so both take the full shape.
export const createTaskSchema = taskBody;
export const updateTaskSchema = taskBody;

export const updateStatusSchema = z.object({
    status: z.enum(STATUSES, { error: "Status must be in_progress or completed" }),
});

export const listTasksQuerySchema = z
    .object({
        from: dateField("from").optional(),
        to: dateField("to").optional(),
        search: z.string({ error: "search must be a single value" }).trim().max(100).optional(),
    })
    .refine((q) => !q.from === !q.to, { error: "from and to must be sent together" })
    .refine((q) => !q.from || q.from <= q.to, { error: "from must be on or before to" });

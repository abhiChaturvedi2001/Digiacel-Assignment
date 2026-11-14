import Task from "../model/taskSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { DATE_RE, dateStringToInt, escapeRegex, toClientFormat, toDbFormat } from "../utils/constant.js";

export const getTasks = async (req, res) => {
    const { from, to, search } = req.query;
    const filter = {};

    if (from || to) {
        if (!DATE_RE.test(from || "") || !DATE_RE.test(to || "")) {
            throw ApiError.badRequest("from and to must both be dates like 2026-11-15");
        }
        filter.date = { $gte: dateStringToInt(from), $lte: dateStringToInt(to) };
    }

    if (search && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const tasks = await Task.find(filter)
        .sort({ date: 1, startTime: 1 })
        .limit(search ? 50 : 0)
        .lean();

    res.json(tasks.map(toClientFormat));
};

export const createTask = async (req, res) => {
    const task = await Task.create(toDbFormat(req.body));
    res.status(201).json(toClientFormat(task.toObject()));
};

export const updateTask = async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, toDbFormat(req.body), {
        new: true,
        runValidators: true,
        lean: true,
    });

    if (!task) {
        throw ApiError.notFound("Task not found");
    }

    res.json(toClientFormat(task));
};

export const updateTaskStatus = async (req, res) => {
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true, lean: true }
    );

    if (!task) {
        throw ApiError.notFound("Task not found");
    }

    res.json(toClientFormat(task));
};

export const deleteTask = async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
        throw ApiError.notFound("Task not found");
    }

    res.status(204).end();
};
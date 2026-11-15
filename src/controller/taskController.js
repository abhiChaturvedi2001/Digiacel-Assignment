import Task from "../model/taskSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { dateStringToInt, escapeRegex, toClientFormat, toDbFormat } from "../utils/constant.js";

// Upper bounds so a single request can never pull an unbounded number of documents.
const SEARCH_LIMIT = 50;
const LIST_LIMIT = 1000;

const UPDATE_OPTIONS = { returnDocument: "after", runValidators: true, lean: true };

// Bodies and queries are already validated and normalised by the zod schemas in routes.

export const getTasks = async (req, res) => {
    const { from, to, search } = res.locals.query;
    const filter = {};

    if (from && to) {
        filter.date = { $gte: dateStringToInt(from), $lte: dateStringToInt(to) };
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const tasks = await Task.find(filter)
        .sort({ date: 1, startTime: 1 })
        .limit(search ? SEARCH_LIMIT : LIST_LIMIT)
        .lean();

    res.json(tasks.map(toClientFormat));
};

export const createTask = async (req, res) => {
    const task = await Task.create(toDbFormat(req.body));
    res.status(201).json(toClientFormat(task.toObject()));
};

export const updateTask = async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, toDbFormat(req.body), UPDATE_OPTIONS);

    if (!task) {
        throw ApiError.notFound("Task not found");
    }

    res.json(toClientFormat(task));
};

export const updateTaskStatus = async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, UPDATE_OPTIONS);

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

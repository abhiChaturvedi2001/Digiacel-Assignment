import { Router } from "express";
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from "../controller/taskController.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import {
    createTaskSchema,
    listTasksQuerySchema,
    updateStatusSchema,
    updateTaskSchema,
} from "../validation/taskSchemas.js";

const routes = Router();

routes.param("id", validateObjectId);

routes.get("/", validate(listTasksQuerySchema, "query"), getTasks);
routes.post("/", validate(createTaskSchema), createTask);
routes.put("/:id", validate(updateTaskSchema), updateTask);
routes.patch("/:id/status", validate(updateStatusSchema), updateTaskStatus);
routes.delete("/:id", deleteTask);

export default routes;

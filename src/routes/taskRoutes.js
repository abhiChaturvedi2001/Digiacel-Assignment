import { Router } from "express";
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from "../controller/taskController.js";

const routes = Router();

routes.get("/", getTasks);
routes.post("/", createTask);
routes.put("/:id", updateTask);
routes.patch("/:id/status", updateTaskStatus);
routes.delete("/:id", deleteTask);

export default routes;
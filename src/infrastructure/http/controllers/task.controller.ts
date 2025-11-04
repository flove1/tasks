import { Elysia } from "elysia";
import { TaskService } from "@application/services/task.service";
import { CreateTaskSchema, TaskStatusSchema } from "@application/dtos/tasks";
import { UpdateTaskSchema } from "@application/dtos/tasks";
import { MessageResponseSchema } from "@application/dtos/common";
import z from "zod";

const TaskResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: TaskStatusSchema,
});

export const taskController = (taskService: TaskService) => {
  const app = new Elysia({ prefix: "/tasks" });

  app.get(
    "/",
    async (context) => {
      const tasks = await taskService.getAllTasks(context.query.status);
      return tasks.map((task) => task.toPrimitive());
    },
    {
      query: z.object({ status: TaskStatusSchema }),
      response: z.array(TaskResponseSchema),
    },
  );

  app.get(
    "/:id",
    async (context) => {
      const task = await taskService.getTaskById(context.params.id);
      return task.toPrimitive();
    },
    {
      params: z.object({ id: z.uuid() }),
      response: TaskResponseSchema,
    },
  );

  app.post(
    "/",
    async (context) => {
      const task = await taskService.createTask(context.body);
      return task.toPrimitive();
    },
    {
      body: CreateTaskSchema,
      response: TaskResponseSchema,
    },
  );

  app.put(
    "/:id",
    async (context) => {
      const task = await taskService.updateTask(context.params.id, context.body);
      return task.toPrimitive();
    },
    {
      params: z.object({ id: z.uuid() }),
      body: UpdateTaskSchema,
      response: TaskResponseSchema,
    },
  );

  app.delete(
    "/:id",
    async (context) => {
      await taskService.deleteTask(context.params.id);
      return { message: "Task deleted successfully" };
    },
    {
      params: z.object({ id: z.uuid() }),
      response: MessageResponseSchema,
    },
  );

  return app;
};

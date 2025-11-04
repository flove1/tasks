import { Elysia, t } from "elysia";
import { TaskService } from "@application/services/task.service";
import { DrizzleTaskRepository } from "@infrastructure/database/repositories/drizzle-task.repository";
import { taskController } from "./controllers/task.controller";
import { config } from "../../shared/config";
import { AppError } from "@shared/errors/app-error";
import { startExpireTaskNotifier } from "@infrastructure/schedulling/expire-task-notifier.cron";
import { logger } from "@shared/logger";

const drizzleTaskRepository = new DrizzleTaskRepository();
const taskService = new TaskService(drizzleTaskRepository);

const app = new Elysia({
  name: "tasks-api",
  seed: {
    version: "0.0.1",
    environment: config.NODE_ENV,
  },
});

app.onError(({ code, error }) => {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
});

app.use(taskController(taskService));

app.get("/health", () => ({ status: "ok" }));

startExpireTaskNotifier(taskService);

export default {
  start: () => {
    const server = app.listen({ port: config.API.PORT }, () => {
      logger.info(`server running on http://localhost:${config.API.PORT}`);
    });
    return server;
  },
};

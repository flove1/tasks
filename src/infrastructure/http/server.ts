import { Elysia } from "elysia";
import { TaskService } from "@application/services/task.service";
import { DrizzleTaskRepository } from "@infrastructure/database/repositories/drizzle-task.repository";
import { taskController } from "./controllers/task.controller";
import { config } from "../../shared/config";
import { startExpireTaskNotifier } from "@infrastructure/schedulling/expire-task-notifier.cron";
import { logger } from "@shared/logger";
import { applyErrorHandler } from "./error-handler";

const drizzleTaskRepository = new DrizzleTaskRepository();
const taskService = new TaskService(drizzleTaskRepository);

export const app = new Elysia({
  name: "tasks-api",
  seed: {
    version: config.VERSION,
    environment: config.NODE_ENV,
  },
});

applyErrorHandler(app);

app.get("/health", () => ({ status: "ok" }));
app.use(taskController(taskService));

startExpireTaskNotifier(taskService);

export default {
  start: () => {
    const server = app.listen({ port: config.API.PORT }, () => {
      logger.info(`server running on http://localhost:${config.API.PORT}`);
    });

    return server;
  },
};

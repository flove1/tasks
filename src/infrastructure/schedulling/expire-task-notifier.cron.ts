import { TaskService } from "@application/services/task.service";
import { logger } from "@shared/logger";

export function startExpireTaskNotifier(taskService: TaskService) {
  setInterval(async () => {
    try {
      await taskService.sendExpiredTaskNotifications();
    } catch (error) {
      logger.error(`error sending expired task notifications: ${JSON.stringify(error)}`);
    }
  }, 60 * 60 * 1000);
}

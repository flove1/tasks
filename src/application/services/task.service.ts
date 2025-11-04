import { ITaskRepository } from "@domain/repositories/task.repository";
import { Task, TaskStatus, UpdateTaskData } from "@domain/entities/task";
import { CreateTaskDto } from "../dtos/tasks";
import { UpdateTaskDto } from "@application/dtos/tasks";
import { NotFoundError, ValidationError } from "@shared/errors/app-error";
import { publishToQueue } from "@infrastructure/queue/redis/redis";
import { logger } from "@shared/logger";

export class TaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, dueDate } = createTaskDto;

    if (!title || title.trim().length === 0) {
      throw new ValidationError("Task title is required");
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const task = Task.create({ title, description: description || null, dueDate: parsedDueDate });

    await this.taskRepository.save(task);
    return task;
  }

  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundError("Task", id);
      }

      return task;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new ValidationError(`Invalid task ID format: ${id}`);
    }
  }

  async getAllTasks(status?: TaskStatus): Promise<Task[]> {
    return this.taskRepository.findAll(status);
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) throw new NotFoundError("Task", id);

      const updateData: UpdateTaskData = {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        status: updateTaskDto.status
      };

      task.update(updateData);
      await this.taskRepository.save(task);

      return task;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new ValidationError(`Invalid task ID format: ${id}`);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) throw new NotFoundError("Task", id);

      await this.taskRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new ValidationError(`Invalid task ID format: ${id}`);
    }
  }

  async completeTask(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) throw new NotFoundError("Task", id);

      task.complete();
      await this.taskRepository.save(task);

      return task;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new ValidationError(`Invalid task ID format: ${id}`);
    }
  }

  async uncompleteTask(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) throw new NotFoundError("Task", id);

      task.uncomplete();
      await this.taskRepository.save(task);

      return task;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      throw new ValidationError(`Invalid task ID format: ${id}`);
    }
  }

  async sendExpiredTaskNotifications(): Promise<void> {
    const expiredTasks = await this.taskRepository.findExpired();

    logger.info(`found ${expiredTasks.length} expired tasks to notify about`);

    for (const task of expiredTasks) {
      const message = JSON.stringify({
        type: 'expired_task',
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate?.toISOString(),
      });

      await publishToQueue('task-notifications', message);
    }
  }
}

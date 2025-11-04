import { eq } from "drizzle-orm";
import { Task, TaskStatus } from "@domain/entities/task";
import { ITaskRepository } from "@domain/repositories/task.repository";
import { db } from "../drizzle";
import { tasks } from "../schema";

export class DrizzleTaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!result) {
      return null;
    }

    return Task.fromPersistence({
      id: result.id,
      title: result.title,
      description: result.description,
      dueDate: result.dueDate,
      status: result.status as TaskStatus,
    });
  }

  async findAll(status?: TaskStatus): Promise<Task[]> {
    const where = status ? eq(tasks.status, status) : undefined;
    const results = await db.query.tasks.findMany({ where });

    return results.map((result) =>
      Task.fromPersistence({
        id: result.id,
        title: result.title,
        description: result.description,
        dueDate: result.dueDate,
        status: result.status as TaskStatus,
      }),
    );
  }

  async save(task: Task): Promise<void> {
    const existing = await this.findById(task.id);

    if (existing) {
      await db
        .update(tasks)
        .set({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
        })
        .where(eq(tasks.id, task.id));

      return;
    }

    await db.insert(tasks).values({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async findExpired(): Promise<Task[]> {
    const now = new Date();
    const results = await db.query.tasks.findMany({
      where: (tasks, { lt, eq }) => lt(tasks.dueDate, now) && eq(tasks.status, TaskStatus.Pending),
    });

    return results.map((result) =>
      Task.fromPersistence({
        id: result.id,
        title: result.title,
        description: result.description,
        dueDate: result.dueDate,
        status: result.status as TaskStatus,
      }),
    );
  }
}

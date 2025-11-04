import { Task, TaskStatus } from "@domain/entities/task";

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(status?: TaskStatus): Promise<Task[]>;
  findExpired(): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

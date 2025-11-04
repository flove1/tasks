import { randomUUID } from "crypto";

export enum TaskStatus {
  Pending = "pending",
  Completed = "completed",
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}

export class Task {
  private constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public dueDate: Date | null,
    public status: TaskStatus,
  ) {}

  static create({
    title,
    description = null,
    dueDate = null,
  }: {
    title: string;
    description?: string | null;
    dueDate?: Date | null;
  }): Task {
    return new Task(randomUUID(), title, description, dueDate, TaskStatus.Pending);
  }

  static fromPersistence({
    id,
    title,
    description,
    dueDate,
    status,
  }: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    status: TaskStatus;
  }): Task {
    return new Task(id, title, description, dueDate, status);
  }

  complete(): void {
    this.status = TaskStatus.Completed;
  }

  uncomplete(): void {
    this.status = TaskStatus.Pending;
  }

  update(data: UpdateTaskData): void {
    if (data.title !== undefined && data.title.trim().length > 0) {
      this.title = data.title;
    }

    if (data.description !== undefined) {
      this.description = data.description;
    }

    if (data.dueDate !== undefined) {
      this.dueDate = data.dueDate;
    }

    if (data.status !== undefined) {
      this.status = data.status;
    }
  }

  toPrimitive() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate?.toISOString() || null,
      status: this.status,
    };
  }
}

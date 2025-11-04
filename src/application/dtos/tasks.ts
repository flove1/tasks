import { TaskStatus } from "@domain/entities/task";
import { z } from "zod";

export const TaskStatusSchema = z.enum(TaskStatus).optional();

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  dueDate: z.iso.datetime().optional().nullable(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const IdSchema = z.object({
  id: z.uuid(),
});

export type IdDto = z.infer<typeof IdSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
  status: TaskStatusSchema,
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;



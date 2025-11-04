import { TaskStatus } from "@domain/entities/task";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 50, enum: Object.values(TaskStatus) as [string, ...string[]] })
    .notNull()
    .default(TaskStatus.Pending),
});

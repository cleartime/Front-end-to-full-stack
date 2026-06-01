import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getPagination, getTotalPages } from "@/lib/pagination";
import { PRIORITIES, TASK_STATUSES, TASK_TYPES } from "@/lib/status";
import { getPrisma } from "@/server/db";

export const createTaskSchema = z.object({
  title: z.string().trim().min(4, "任务标题至少 4 个字符").max(80, "任务标题过长"),
  description: z.string().trim().min(8, "任务描述至少 8 个字符").max(240, "任务描述过长"),
  type: z.enum(TASK_TYPES).default("BACKEND"),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  storyPoints: z.number().int().min(1).max(13).default(3)
});

export const updateTaskSchema = z.object({
  status: z.enum(TASK_STATUSES)
});

export async function listTasks(searchParams: URLSearchParams, ownerId: string) {
  const prisma = getPrisma();
  const { page, pageSize, skip, take } = getPagination({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize")
  });

  const keyword = searchParams.get("keyword")?.trim();
  const status = searchParams.get("status")?.trim();
  const sort = searchParams.get("sort") ?? "updatedAt:desc";
  const [sortField, sortDirection] = sort.split(":");

  const where: Prisma.ProjectTaskWhereInput = {
    ownerId,
    ...(status && TASK_STATUSES.includes(status as never) ? { status } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } },
            { branch: { contains: keyword } }
          ]
        }
      : {})
  };

  const allowedSortFields = new Set(["updatedAt", "createdAt", "priority", "storyPoints"]);
  const orderByField = allowedSortFields.has(sortField) ? sortField : "updatedAt";
  const orderByDirection = sortDirection === "asc" ? "asc" : "desc";

  const [items, total] = await prisma.$transaction([
    prisma.projectTask.findMany({
      where,
      orderBy: { [orderByField]: orderByDirection },
      skip,
      take,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        priority: true,
        branch: true,
        storyPoints: true,
        updatedAt: true
      }
    }),
    prisma.projectTask.count({ where })
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: getTotalPages(total, pageSize)
    }
  };
}

export async function createTask(ownerId: string, input: z.infer<typeof createTaskSchema>) {
  const prisma = getPrisma();
  const data = createTaskSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const task = await tx.projectTask.create({
      data: {
        ...data,
        ownerId,
        status: "TODO",
        branch: `feature/${data.type.toLowerCase()}-${Date.now().toString(36)}`
      }
    });

    await tx.backendLog.create({
      data: {
        level: "INFO",
        service: "tasks",
        message: `Created task ${task.title}`,
        durationMs: 31
      }
    });

    return task;
  });
}

export async function updateTaskStatus(taskId: string, ownerId: string, input: z.infer<typeof updateTaskSchema>) {
  const prisma = getPrisma();
  const data = updateTaskSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const task = await tx.projectTask.findFirst({
      where: { id: taskId, ownerId },
      select: { id: true, title: true }
    });

    if (!task) {
      return null;
    }

    const updated = await tx.projectTask.update({
      where: { id: task.id },
      data: { status: data.status }
    });

    await tx.backendLog.create({
      data: {
        level: "INFO",
        service: "tasks",
        message: `Task status changed to ${data.status}: ${task.title}`,
        durationMs: 27
      }
    });

    return updated;
  });
}

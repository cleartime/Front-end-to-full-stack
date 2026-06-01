export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export const TASK_TYPES = ["FRONTEND", "BACKEND", "DATABASE", "SECURITY", "DEVOPS", "AI", "SYSTEM_DESIGN"] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];

export const statusLabel: Record<string, string> = {
  TODO: "待开始",
  IN_PROGRESS: "进行中",
  REVIEW: "评审中",
  DONE: "已完成",
  READY: "可学习",
  LOCKED: "未解锁"
};

export const priorityLabel: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "紧急"
};

export const typeLabel: Record<string, string> = {
  FRONTEND: "前端",
  BACKEND: "后端",
  DATABASE: "数据库",
  SECURITY: "安全",
  DEVOPS: "部署",
  AI: "AI 工程",
  SYSTEM_DESIGN: "系统设计"
};

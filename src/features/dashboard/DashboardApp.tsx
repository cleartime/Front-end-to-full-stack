"use client";

import {
  Activity,
  ArrowRight,
  Bot,
  Boxes,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Code2,
  Cloud,
  Cpu,
  Database,
  FileCheck2,
  Gauge,
  GitBranch,
  KeyRound,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Lock,
  LockKeyhole,
  LogOut,
  Network,
  PackageCheck,
  Play,
  Plus,
  RefreshCw,
  Route,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TableProperties,
  TerminalSquare,
  Trophy,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { priorityLabel, statusLabel, TASK_STATUSES, TASK_TYPES, typeLabel } from "@/lib/status";

type ApiEnvelope<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  level: string;
  weeklyHours: number;
};

type LearningModule = {
  id: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  progress: number;
  sequence: number;
  interviewFocus: string;
};

type ProjectTask = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  branch: string;
  storyPoints: number;
  updatedAt: string;
};

type InterviewQuestion = {
  id: string;
  category: string;
  title: string;
  difficulty: string;
  status: string;
  answerHint: string;
};

type BackendLog = {
  id: string;
  level: string;
  service: string;
  message: string;
  durationMs: number;
  createdAt: string;
};

type Architecture = {
  requestPath: string[];
  modules: Array<{ name: string; detail: string }>;
  interviewAngles: string[];
};

type TaskResponse = {
  items: ProjectTask[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type LessonStageKey = "mainline" | "path" | "project" | "api" | "interview" | "review";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!payload.ok) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

const architectureTracks = [
  {
    title: "整体架构",
    icon: <Network size={18} />,
    summary: "这是一个 Next.js 全栈项目：浏览器展示页面，API 处理业务，Prisma 访问数据库。",
    flow: ["Browser", "React", "/api", "Service", "Prisma", "DB"],
    questions: ["这是全栈项目吗？", "前后端怎么分层？", "为什么前端不直连数据库？"],
    answer: "前端只发请求；后端负责鉴权、校验、业务和数据库，职责清楚。"
  },
  {
    title: "前端架构",
    icon: <Layers3 size={18} />,
    summary: "前端是一个 Dashboard：组件负责展示，状态负责交互，fetchJson 统一调用后端。",
    flow: ["Page", "Dashboard", "State", "fetchJson", "API", "Render"],
    questions: ["页面怎么组织？", "状态放哪里？", "接口错误怎么显示？"],
    answer: "核心在 DashboardApp：登录态、任务、面试题、AI 输出都由 React state 驱动。"
  },
  {
    title: "后端架构",
    icon: <Route size={18} />,
    summary: "后端用 Route Handler 写 REST API，再进入鉴权、Zod 校验、服务层和统一响应。",
    flow: ["Route", "Auth", "Zod", "Task Service", "ok/fail", "Log"],
    questions: ["接口怎么设计？", "业务逻辑放哪？", "错误码怎么统一？"],
    answer: "route.ts 只做入口；src/server 里放 auth、http、tasks 等后端能力。"
  },
  {
    title: "数据库架构",
    icon: <TableProperties size={18} />,
    summary: "数据库有用户、任务、学习模块、面试题和后端日志；任务写入会带事务日志。",
    flow: ["User", "ProjectTask", "Transaction", "BackendLog", "Index", "Query"],
    questions: ["表怎么设计？", "索引为什么加？", "事务解决什么问题？"],
    answer: "User 和 ProjectTask 是一对多；任务状态更新和日志写入放在同一个事务里。"
  },
  {
    title: "安全架构",
    icon: <KeyRound size={18} />,
    summary: "登录有频率限制，密码用 bcrypt，登录态放 httpOnly Cookie，后端 requireUser 校验。",
    flow: ["Rate Limit", "bcrypt", "JWT", "Cookie", "requireUser", "RBAC"],
    questions: ["JWT 放哪里？", "httpOnly 有什么用？", "还要防 CSRF 吗？"],
    answer: "Cookie 防止 JS 直接读 token；生产环境还要配 SameSite、HTTPS 和 CSRF 策略。"
  },
  {
    title: "AI 架构",
    icon: <Cpu size={18} />,
    summary: "AI Mentor 当前是本地流式模拟，接口协议已经按真实 AI streaming 方式设计。",
    flow: ["Prompt", "Limit", "Provider", "Stream", "Reader", "UI"],
    questions: ["AI 接口怎么流式？", "如何替换真实模型？", "如何防 prompt injection？"],
    answer: "前端读 ReadableStream；后端保留 provider 扩展点，生产环境可换真实模型。"
  },
  {
    title: "运维部署架构",
    icon: <Cloud size={18} />,
    summary: "可以部署给别人看；正式承载真实用户时，数据库建议换 PostgreSQL，日志接监控。",
    flow: ["Git", "CI", "Build", "Docker", "Next App", "PostgreSQL"],
    questions: ["怎么上线？", "环境变量放哪？", "SQLite 能不能生产用？"],
    answer: "SQLite 适合本地训练和演示；正式多用户要用 PostgreSQL、HTTPS、密钥管理和监控。"
  },
  {
    title: "测试与质量",
    icon: <FileCheck2 size={18} />,
    summary: "项目已有 typecheck、unit test、production build；上线前还要补 e2e 和接口压测。",
    flow: ["Typecheck", "Unit Test", "Build", "Smoke", "Logs", "Alert"],
    questions: ["怎么保证质量？", "测什么？", "线上怎么发现问题？"],
    answer: "本地先过类型、测试和构建；线上看错误率、慢接口、登录失败和 AI 调用成本。"
  }
];

const interviewCheatsheet = [
  ["项目一句话", "这是一个 Next.js 全栈训练台，前端、API、鉴权、数据库、AI 流式接口都在同一个项目里。"],
  ["前后端通信", "前端用 fetch 调 /api；后端统一返回 { ok, data } 或 { ok, error }。"],
  ["登录鉴权", "登录校验密码后签 JWT，写入 httpOnly Cookie，后端接口通过 requireUser 拦截。"],
  ["接口校验", "所有写接口用 Zod 校验，防止脏数据进入服务层和数据库。"],
  ["数据库设计", "User 管用户，ProjectTask 管任务，BackendLog 管审计，LearningModule 和 InterviewQuestion 管学习内容。"],
  ["事务", "创建或更新任务时，同时写任务和日志；任一步失败就一起回滚。"],
  ["性能", "分页限制 pageSize，常用查询字段加索引，学习模块接口加短缓存头。"],
  ["安全", "限流防刷，bcrypt 存密码，Cookie httpOnly，生产环境补 HTTPS、CSRF、CORS 白名单。"],
  ["AI", "接口按流式响应设计，现在是本地模拟，后续可以替换 OpenAI 或其他模型 provider。"],
  ["部署", "演示可直接跑 Next；正式生产建议 Docker/平台部署 + PostgreSQL + 环境变量 + 日志监控。"],
  ["监控", "现在有 BackendLog 演示；生产要接请求日志、错误率、慢查询、告警。"],
  ["扩展", "可继续加多租户、RBAC 角色、Redis 缓存、队列、文件上传、真实 AI provider。"]
];

const postgresLocalSteps = [
  ["1. 启动数据库", "npm run postgres:up", "用 Docker 在本机启动 PostgreSQL，端口是 5432。"],
  ["2. 切换环境变量", "cp .env.postgres.example .env", "让项目连接 postgresql://fullstack:.../fullstack_lab。"],
  ["3. 生成 Prisma Client", "npm run db:pg:generate", "告诉 Prisma 当前使用 PostgreSQL schema。"],
  ["4. 建表", "npm run db:pg:push", "把 User、ProjectTask、BackendLog 等表建到 PostgreSQL。"],
  ["5. 写入演示数据", "npm run db:seed", "写入登录账号、学习模块、任务、面试题和日志。"],
  ["6. 查看数据", "npm run db:pg:studio", "打开 Prisma Studio，在浏览器里直接看表和数据。"]
];

const backendStorySlides = [
  {
    step: "01",
    label: "从按钮开始",
    title: "用户点按钮以后，前端把事情交给谁？",
    plain: "前端不直接改数据库。前端只负责收集用户动作，然后发请求给后端。",
    analogy: "像调用一个组件回调：你传参数，对方内部怎么处理由它负责。",
    project: "DashboardApp.tsx 点击按钮后 fetch /api/tasks",
    interview: "先讲完整链路：点击 -> fetch -> API -> 数据库 -> 返回 -> 页面更新。",
    flow: ["点击按钮", "fetch", "/api/tasks", "后端处理", "返回结果", "页面更新"]
  },
  {
    step: "02",
    label: "API",
    title: "API 就是前端和后端之间的合同",
    plain: "前端按合同传参数，后端按合同返回数据。合同稳定，前后端就能分工。",
    analogy: "像你写组件 props 类型：传什么、返回什么要说清楚。",
    project: "src/app/api/tasks/route.ts、src/app/api/auth/login/route.ts",
    interview: "讲 REST：GET 查数据，POST 新建，PATCH 修改；错误也要有统一格式。",
    flow: ["请求方法", "URL", "参数", "响应结构", "错误码"]
  },
  {
    step: "03",
    label: "后端校验",
    title: "为什么前端校验了，后端还要再校验？",
    plain: "因为浏览器不可信。别人可以绕过页面，直接用脚本请求你的 API。",
    analogy: "前端表单校验是体验；后端 Zod 校验是底线。",
    project: "createTaskSchema、updateTaskSchema",
    interview: "讲安全和稳定性：后端入口必须校验，避免脏数据进数据库。",
    flow: ["收到请求", "Zod 校验", "不合法返回 400", "合法进入服务层"]
  },
  {
    step: "04",
    label: "服务层",
    title: "后端不是把所有逻辑都写在 route.ts 里",
    plain: "route.ts 只做入口，真正的业务逻辑放到 service 里，方便复用和测试。",
    analogy: "像前端页面组件不要塞满所有逻辑，要拆 hooks、utils、components。",
    project: "src/server/tasks.ts",
    interview: "讲分层：Route 负责 HTTP，Service 负责业务，DB 层负责数据访问。",
    flow: ["route.ts", "requireUser", "service", "prisma", "ok/fail"]
  },
  {
    step: "05",
    label: "数据库表",
    title: "数据库表就是后端的长期 state",
    plain: "React state 刷新页面会没，数据库里的数据不会没。表是用来保存长期数据的结构。",
    analogy: "表像更严格的 TypeScript interface，而且会真的约束数据。",
    project: "prisma/schema.prisma",
    interview: "讲 User、ProjectTask、BackendLog：谁拥有谁，谁记录什么。",
    flow: ["User", "ProjectTask", "LearningModule", "InterviewQuestion", "BackendLog"]
  },
  {
    step: "06",
    label: "主键 / 外键",
    title: "主键、外键、唯一约束是在保证数据不乱",
    plain: "主键保证每行唯一；外键保证任务真的属于某个用户；唯一约束保证邮箱不重复。",
    analogy: "主键像 React list key；外键像对象引用；唯一约束像不可重复的用户名。",
    project: "User.email @unique、ProjectTask.ownerId -> User.id",
    interview: "问数据关系，就讲一对多、唯一约束、级联删除。",
    flow: ["User.id", "ProjectTask.ownerId", "User.email unique"]
  },
  {
    step: "07",
    label: "查询 / 分页",
    title: "数据量变大后，不能一次把所有数据都返回",
    plain: "后端要根据 where 条件查数据，用 orderBy 排序，再用 pageSize 限制返回数量。",
    analogy: "像前端长列表不能一次渲染一万行，要分页或虚拟列表。",
    project: "listTasks：page、pageSize、skip、take",
    interview: "问大数据量，就讲分页、排序、过滤条件，以及 cursor pagination。",
    flow: ["keyword", "where", "orderBy", "skip/take", "meta"]
  },
  {
    step: "08",
    label: "索引",
    title: "索引就是数据库里的目录",
    plain: "没有索引时，数据库可能从第一行扫到最后一行。有索引时，可以更快找到目标范围。",
    analogy: "像浏览器搜索不是肉眼从页面第一行看到最后一行，而是有搜索结构。",
    project: "@@index([ownerId, updatedAt])、@@index([status, priority])",
    interview: "讲清楚：常用于 where、orderBy、join 的字段才值得加索引；索引也有写入成本。",
    flow: ["where ownerId", "orderBy updatedAt", "命中索引", "更快返回"]
  },
  {
    step: "09",
    label: "事务",
    title: "事务就是“要么一起成功，要么一起失败”",
    plain: "任务状态更新和日志写入是一个整体，不能只成功一半。",
    analogy: "像一次保存多个表单字段，不能只保存标题却丢了内容。",
    project: "prisma.$transaction、createTask、updateTaskStatus",
    interview: "讲一致性：任务改了必须有审计日志；失败就回滚，避免数据对不上。",
    flow: ["开始事务", "更新任务", "写日志", "提交", "失败回滚"]
  },
  {
    step: "10",
    label: "上线视角",
    title: "最后再讲 N+1、连接池、缓存和 PostgreSQL",
    plain: "这些是数据量和用户量上来后的问题：少发查询、复用连接、热点数据缓存、正式库用 PostgreSQL。",
    analogy: "像前端避免循环请求、避免重复渲染、给接口结果做缓存。",
    project: "PrismaClient 单例、Cache-Control、本地 PostgreSQL 文档",
    interview: "收尾讲扩展：N+1 用批量查询解决，连接池控并发，缓存减压，生产换 PostgreSQL。",
    flow: ["避免 N+1", "连接池", "缓存", "PostgreSQL", "监控"]
  }
];

export function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [tasks, setTasks] = useState<TaskResponse>({ items: [], meta: { page: 1, pageSize: 8, total: 0, totalPages: 1 } });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [logs, setLogs] = useState<BackendLog[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeStage, setActiveStage] = useState<LessonStageKey>("mainline");

  const completedModules = useMemo(() => modules.filter((item) => item.status === "DONE").length, [modules]);
  const activeTasks = useMemo(() => tasks.items.filter((item) => item.status !== "DONE").length, [tasks.items]);
  const hardQuestions = useMemo(() => questions.filter((item) => item.difficulty === "HARD").length, [questions]);
  const overallProgress = useMemo(() => {
    if (modules.length === 0) {
      return 0;
    }

    return Math.round(modules.reduce((total, module) => total + module.progress, 0) / modules.length);
  }, [modules]);
  const nextModule = useMemo(() => modules.find((module) => module.status !== "DONE") ?? modules[0] ?? null, [modules]);
  const reviewQuestions = useMemo(() => questions.filter((item) => item.status === "REVIEWED").length, [questions]);
  const lessonStages = useMemo(
    () =>
      [
        {
          key: "mainline" as const,
          nav: "今日学习",
          title: "第 1 关：今天只学一个重点",
          goal: "先知道今天要学什么，为什么学，完成后会得到什么反馈。",
          icon: <LayoutDashboard size={17} />,
          xp: 60
        },
        {
          key: "path" as const,
          nav: "学习路径",
          title: "第 2 关：看清全栈路线",
          goal: "只看当前所在位置、上一关和下一关，不一次性背完整路线。",
          icon: <GitBranch size={17} />,
          xp: 40
        },
        {
          key: "project" as const,
          nav: "实战项目",
          title: "第 3 关：动手改一个真实任务",
          goal: "通过任务状态变化，理解 CRUD、事务和后端日志。",
          icon: <ClipboardList size={17} />,
          xp: 50
        },
        {
          key: "api" as const,
          nav: "代码实验",
          title: "第 4 关：运行一个 API",
          goal: "像前端调接口一样观察请求、响应、错误码和日志。",
          icon: <TerminalSquare size={17} />,
          xp: 45
        },
        {
          key: "interview" as const,
          nav: "题库挑战",
          title: "第 5 关：把知识讲成面试答案",
          goal: "只练几道题，重点是说清项目里的对应实现。",
          icon: <ListChecks size={17} />,
          xp: 55
        },
        {
          key: "review" as const,
          nav: "复盘资料",
          title: "第 6 关：架构和数据库复盘",
          goal: "按小卡片复盘整体架构、后端、数据库、索引、事务和部署。",
          icon: <Server size={17} />,
          xp: 70
        }
      ],
    []
  );
  const activeStageIndex = lessonStages.findIndex((stage) => stage.key === activeStage);
  const normalizedStageIndex = activeStageIndex >= 0 ? activeStageIndex : 0;
  const currentStage = lessonStages[normalizedStageIndex];
  const stageProgress = Math.round(((normalizedStageIndex + 1) / lessonStages.length) * 100);

  function selectStage(stage: LessonStageKey) {
    setActiveStage(stage);
  }

  function goToRelativeStage(offset: number) {
    const nextIndex = Math.min(lessonStages.length - 1, Math.max(0, normalizedStageIndex + offset));
    setActiveStage(lessonStages[nextIndex].key);
  }

  async function loadTasks(nextKeyword = keyword, nextStatus = statusFilter) {
    const params = new URLSearchParams({
      page: "1",
      pageSize: "8",
      sort: "updatedAt:desc"
    });

    if (nextKeyword.trim()) {
      params.set("keyword", nextKeyword.trim());
    }

    if (nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }

    const data = await fetchJson<TaskResponse>(`/api/tasks?${params.toString()}`);
    setTasks(data);
  }

  async function loadDashboard() {
    setBusy(true);
    setError("");

    try {
      const [moduleData, taskData, questionData, architectureData, logData] = await Promise.all([
        fetchJson<{ modules: LearningModule[] }>("/api/learning/modules"),
        fetchJson<TaskResponse>("/api/tasks?page=1&pageSize=8&sort=updatedAt:desc"),
        fetchJson<{ questions: InterviewQuestion[]; summary: Record<string, number> }>("/api/interview/questions"),
        fetchJson<{ architecture: Architecture }>("/api/system-design"),
        fetchJson<{ logs: BackendLog[] }>("/api/logs")
      ]);

      setModules(moduleData.modules);
      setTasks(taskData);
      setQuestions(questionData.questions);
      setArchitecture(architectureData.architecture);
      setLogs(logData.logs);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败");
    } finally {
      setBusy(false);
    }
  }

  async function bootstrap() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchJson<{ user: User }>("/api/users/me");
      setUser(data.user);
      await loadDashboard();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loginDemo() {
    setBusy(true);
    setError("");

    try {
      const data = await fetchJson<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "frontend@example.com",
          password: "fullstack123"
        })
      });
      setUser(data.user);
      await loadDashboard();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetchJson<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function changeTaskStatus(taskId: string, status: string) {
    setBusy(true);
    setError("");

    try {
      await fetchJson<{ task: ProjectTask }>(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await Promise.all([loadTasks(), refreshLogs()]);
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "更新任务失败");
    } finally {
      setBusy(false);
    }
  }

  async function createQuickTask(input: { title: string; description: string; type: string; priority: string; storyPoints: number }) {
    setBusy(true);
    setError("");

    try {
      await fetchJson<{ task: ProjectTask }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(input)
      });
      await Promise.all([loadTasks(), refreshLogs()]);
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "创建任务失败");
    } finally {
      setBusy(false);
    }
  }

  async function refreshLogs() {
    const data = await fetchJson<{ logs: BackendLog[] }>("/api/logs");
    setLogs(data.logs);
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <main className="loading-screen">
        <Loader2 className="spin" aria-hidden="true" />
        <span>正在启动训练台</span>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen busy={busy} error={error} onLogin={loginDemo} />;
  }

  return (
    <main className="app-shell lesson-app-shell">
      <aside className="side-nav" aria-label="主导航">
        <div className="brand-block">
          <div className="brand-mark">
            <Boxes size={20} />
          </div>
          <div>
            <strong>全栈修炼场</strong>
            <span>闯关学习平台</span>
          </div>
        </div>

        <nav className="nav-list">
          {lessonStages.map((stage, index) => (
            <button
              className={stage.key === activeStage ? "nav-item active" : "nav-item"}
              key={stage.key}
              type="button"
              onClick={() => selectStage(stage.key)}
            >
              {stage.icon}
              <span>{index + 1}. {stage.nav}</span>
            </button>
          ))}
        </nav>

        <div className="nav-footer">
          <span>Demo</span>
          <strong>{user.email}</strong>
        </div>
      </aside>

      <section className="workspace lesson-workspace">
        <header className="topbar lesson-topbar">
          <div>
            <p className="page-kicker">前端转全栈学习平台</p>
            <h1>{currentStage.title}</h1>
            <p className="lesson-goal">{currentStage.goal}</p>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                value={keyword}
                placeholder="搜索任务、分支、接口"
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadTasks(event.currentTarget.value, statusFilter);
                  }
                }}
              />
            </label>
            <button className="icon-button" type="button" onClick={() => loadDashboard()} aria-label="刷新数据">
              <RefreshCw size={17} className={busy ? "spin" : undefined} />
            </button>
            <button className="secondary-button" type="button" onClick={logout}>
              <LogOut size={16} />
              退出
            </button>
          </div>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}

        <section className="lesson-player" aria-label="逐关学习播放器">
          <LessonStepper stages={lessonStages} activeStage={activeStage} progress={stageProgress} onSelectStage={selectStage} />

          <section className="lesson-stage-card">
            <div className="lesson-stage-body">
              {activeStage === "mainline" ? (
                <div className="stage-two-column">
                  <LearningHero
                    user={user}
                    nextModule={nextModule}
                    overallProgress={overallProgress}
                    activeTasks={activeTasks}
                    hardQuestions={hardQuestions}
                    onContinue={() => selectStage("path")}
                    onPractice={() => selectStage("project")}
                  />
                  <ProgressSidebar
                    user={user}
                    completedModules={completedModules}
                    moduleCount={modules.length}
                    reviewQuestions={reviewQuestions}
                    questionCount={questions.length}
                    overallProgress={overallProgress}
                  />
                </div>
              ) : null}

              {activeStage === "path" ? (
                <div className="stage-focus-layout">
                  <StageCoach
                    icon={<GitBranch size={28} />}
                    title="先看自己在地图哪里"
                    points={["绿色是已经完成", "蓝色是当前关", "锁住的是后面再学"]}
                    reward="+40 XP"
                  />
                  <LearningRoadmap modules={modules} nextModuleId={nextModule?.id} />
                </div>
              ) : null}

              {activeStage === "project" ? (
                <div className="stage-focus-layout">
                  <StageCoach
                    icon={<ClipboardList size={28} />}
                    title="动手只做一个动作"
                    points={["改一个任务状态", "看后端日志变化", "理解事务为什么存在"]}
                    reward="+50 XP"
                  />
                  <TaskBoard
                    tasks={tasks}
                    keyword={keyword}
                    statusFilter={statusFilter}
                    onKeywordChange={setKeyword}
                    onStatusChange={(value) => {
                      setStatusFilter(value);
                      loadTasks(keyword, value);
                    }}
                    onSearch={() => loadTasks(keyword, statusFilter)}
                    onTaskStatusChange={changeTaskStatus}
                    onCreateTask={createQuickTask}
                  />
                </div>
              ) : null}

              {activeStage === "api" ? (
                <div className="stage-focus-layout two-panels">
                  <StageCoach
                    icon={<TerminalSquare size={28} />}
                    title="先跑接口，再看结果"
                    points={["点一个 GET 接口", "看统一响应结构", "再看日志怎么记录"]}
                    reward="+45 XP"
                  />
                  <ApiPractice />
                  <ActivityLog logs={logs} onRefresh={refreshLogs} />
                </div>
              ) : null}

              {activeStage === "interview" ? (
                <div className="stage-focus-layout two-panels">
                  <StageCoach
                    icon={<ListChecks size={28} />}
                    title="一次只练几道题"
                    points={["先读题", "再找项目对应代码", "最后讲成 30 秒答案"]}
                    reward="+55 XP"
                  />
                  <InterviewChecklist questions={questions} />
                  <AiMentor />
                </div>
              ) : null}

              {activeStage === "review" ? <ResourceReviewPanel architecture={architecture} /> : null}
            </div>

            <LessonPager
              currentIndex={normalizedStageIndex}
              total={lessonStages.length}
              reward={currentStage.xp}
              onPrevious={() => goToRelativeStage(-1)}
              onNext={() => goToRelativeStage(1)}
            />
          </section>
        </section>
      </section>
    </main>
  );
}

function ArchitectureLearningPanel({ architecture }: { architecture: Architecture | null }) {
  return (
    <section className="panel architecture-learning" id="architecture">
      <PanelHeader icon={<Server size={18} />} title="全栈面试地图" action="最直白版本" />

      <div className="plain-summary">
        <article>
          <strong>这个项目是什么？</strong>
          <p>一个能登录、查数据、写数据、看日志、跑 AI 流式接口的 Next.js 全栈项目。</p>
        </article>
        <article>
          <strong>最核心流程</strong>
          <p>用户点页面，前端调 API，后端鉴权和校验，服务层处理业务，Prisma 读写数据库。</p>
        </article>
        <article>
          <strong>能不能部署？</strong>
          <p>能部署给别人看；正式多用户使用时，把 SQLite 换 PostgreSQL，并接监控和 HTTPS。</p>
        </article>
      </div>

      <section className="architecture-section">
        <div className="architecture-card-heading">
          <strong>一张图看懂整体架构</strong>
          <span>面试时先讲这一张：前端、后端、数据库、AI、部署分别在哪里。</span>
        </div>
        <div className="wide-flow" aria-label="整体全栈架构图">
          {["用户", "React 页面", "Next.js API", "Auth / Zod", "Service", "Prisma", "SQLite / PostgreSQL", "Log / AI"].map((item, index, list) => (
            <div className="wide-flow-item" key={item}>
              <span>{item}</span>
              {index < list.length - 1 ? <ArrowRight size={17} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="track-grid" aria-label="面试架构分区">
        {architectureTracks.map((track) => (
          <article className="track-card" key={track.title}>
            <div className="track-header">
              <div className="track-icon">{track.icon}</div>
              <div>
                <strong>{track.title}</strong>
                <p>{track.summary}</p>
              </div>
            </div>
            <MiniFlow items={track.flow} />
            <div className="track-answer">
              <span>直白回答</span>
              <p>{track.answer}</p>
            </div>
            <div className="track-questions">
              {track.questions.map((question) => (
                <span key={question}>{question}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="architecture-section split-architecture">
        <div>
          <div className="architecture-card-heading">
            <strong>数据库关系图</strong>
            <span>这个项目的数据库不复杂，但足够讲清关系、索引和事务。</span>
          </div>
          <div className="er-diagram" aria-label="数据库关系图">
            <article>
              <Database size={17} />
              <strong>User</strong>
              <span>登录用户</span>
            </article>
            <ArrowRight size={18} aria-hidden="true" />
            <article>
              <TableProperties size={17} />
              <strong>ProjectTask</strong>
              <span>用户任务，一对多</span>
            </article>
            <ArrowRight size={18} aria-hidden="true" />
            <article>
              <Activity size={17} />
              <strong>BackendLog</strong>
              <span>审计日志，事务写入</span>
            </article>
          </div>
          <div className="support-tables">
            <span>LearningModule：学习路线</span>
            <span>InterviewQuestion：面试题</span>
            <span>Index：status / priority / ownerId</span>
          </div>
        </div>

        <div>
          <div className="architecture-card-heading">
            <strong>生产部署图</strong>
            <span>演示环境和正式环境要分清楚，这是面试常见追问。</span>
          </div>
          <div className="deploy-flow" aria-label="生产部署流程图">
            <span><GitBranch size={15} /> Git</span>
            <span><PackageCheck size={15} /> CI Build</span>
            <span><Cloud size={15} /> Next App</span>
            <span><Database size={15} /> PostgreSQL</span>
            <span><Gauge size={15} /> Logs / Monitor</span>
          </div>
          <div className="production-note">
            <strong>正式环境要改什么？</strong>
            <p>本项目默认 SQLite 是为了本地学习零成本。真实用户上线时，数据库换 PostgreSQL，配置强 AUTH_SECRET，启用 HTTPS，把日志接到监控平台，并补 e2e 测试。</p>
          </div>
        </div>
      </section>

      <section className="architecture-section postgres-local-section">
        <div className="architecture-card-heading">
          <strong>本地 PostgreSQL 怎么跑、怎么看</strong>
          <span>推荐用 Docker 跑本地 PostgreSQL；用 Prisma Studio 或数据库客户端查看表数据。</span>
        </div>

        <div className="postgres-answer-grid">
          <article>
            <strong>需要安装什么？</strong>
            <p>推荐安装 Docker Desktop。项目已经提供 PostgreSQL 容器配置，不需要手动安装数据库服务。想用命令行看库，再装 psql；想图形化看库，可以用 Prisma Studio、DBeaver、TablePlus 或 pgAdmin。</p>
          </article>
          <article>
            <strong>能不能看到数据库？</strong>
            <p>可以。运行 <code>npm run db:pg:studio</code> 后，浏览器会打开 Prisma Studio，能直接看到 User、ProjectTask、LearningModule、InterviewQuestion、BackendLog 这些表。</p>
          </article>
        </div>

        <div className="postgres-command-list">
          {postgresLocalSteps.map(([title, command, detail]) => (
            <article key={title}>
              <strong>{title}</strong>
              <code>{command}</code>
              <p>{detail}</p>
            </article>
          ))}
        </div>

        <div className="postgres-connection-box">
          <strong>数据库连接信息</strong>
          <div>
            <span>Host: localhost</span>
            <span>Port: 5432</span>
            <span>Database: fullstack_lab</span>
            <span>User: fullstack</span>
            <span>Password: fullstack123</span>
          </div>
        </div>
      </section>

      <section className="architecture-section backend-story-section">
        <div className="architecture-card-heading">
          <strong>给前端同学看的后端 / 数据库 PPT 流程</strong>
          <span>按“用户点按钮”一路讲到数据库和上线，每一页只讲一个重点。</span>
        </div>

        <div className="storyline-rail" aria-label="后端学习流程页码">
          {backendStorySlides.map((slide) => (
            <span key={slide.step}>
              <strong>{slide.step}</strong>
              <small>{slide.label}</small>
            </span>
          ))}
        </div>

        <div className="story-slide-list">
          {backendStorySlides.map((slide) => (
            <article className="story-slide" key={slide.step}>
              <div className="story-slide-number">{slide.step}</div>
              <div className="story-slide-main">
                <span>{slide.label}</span>
                <h3>{slide.title}</h3>
                <p>{slide.plain}</p>
                <MiniFlow items={slide.flow} />
              </div>
              <dl className="story-slide-notes">
                <div>
                  <dt>前端类比</dt>
                  <dd>{slide.analogy}</dd>
                </div>
                <div>
                  <dt>项目位置</dt>
                  <dd>{slide.project}</dd>
                </div>
                <div>
                  <dt>面试说法</dt>
                  <dd>{slide.interview}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="architecture-section">
        <div className="architecture-card-heading">
          <strong>面试速答清单</strong>
          <span>别人看这个页面，也能快速知道每个点怎么讲。</span>
        </div>
        <div className="cheatsheet-grid">
          {interviewCheatsheet.map(([label, answer]) => (
            <article key={label}>
              <strong>{label}</strong>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      {architecture ? (
        <section className="architecture-section">
          <div className="architecture-card-heading">
            <strong>继续追问点</strong>
            <span>这些问题是面试官最容易顺着项目继续问的。</span>
          </div>
          <div className="interview-angles">
            <div>
              {architecture.interviewAngles.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ResourceReviewPanel({ architecture }: { architecture: Architecture | null }) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const activeTrack = architectureTracks[trackIndex] ?? architectureTracks[0];
  const activeStory = backendStorySlides[storyIndex] ?? backendStorySlides[0];

  return (
    <section className="resource-review" aria-label="架构与数据库复盘">
      <div className="resource-track-nav" aria-label="复盘主题">
        {architectureTracks.map((track, index) => (
          <button className={index === trackIndex ? "active" : ""} key={track.title} type="button" onClick={() => setTrackIndex(index)}>
            {track.icon}
            <span>{track.title}</span>
          </button>
        ))}
      </div>

      <article className="resource-focus-card">
        <div className="resource-focus-heading">
          <div className="track-icon">{activeTrack.icon}</div>
          <div>
            <strong>{activeTrack.title}</strong>
            <p>{activeTrack.summary}</p>
          </div>
        </div>
        <MiniFlow items={activeTrack.flow} />
        <div className="track-answer">
          <span>面试直白说法</span>
          <p>{activeTrack.answer}</p>
        </div>
        <div className="track-questions">
          {activeTrack.questions.map((question) => (
            <span key={question}>{question}</span>
          ))}
        </div>
      </article>

      <article className="story-practice-card">
        <div className="story-practice-header">
          <div>
            <span>{activeStory.step} / {backendStorySlides.length.toString().padStart(2, "0")}</span>
            <strong>{activeStory.title}</strong>
          </div>
          <div className="story-practice-actions">
            <button className="icon-button" type="button" onClick={() => setStoryIndex((value) => Math.max(0, value - 1))} disabled={storyIndex === 0}>
              <ArrowRight className="rotate-180" size={15} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => setStoryIndex((value) => Math.min(backendStorySlides.length - 1, value + 1))}
              disabled={storyIndex === backendStorySlides.length - 1}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <p>{activeStory.plain}</p>
        <MiniFlow items={activeStory.flow} />
        <dl className="resource-notes">
          <div>
            <dt>前端类比</dt>
            <dd>{activeStory.analogy}</dd>
          </div>
          <div>
            <dt>项目位置</dt>
            <dd>{activeStory.project}</dd>
          </div>
          <div>
            <dt>面试说法</dt>
            <dd>{activeStory.interview}</dd>
          </div>
        </dl>
      </article>

      <article className="resource-side-card">
        <strong>这一关怎么学</strong>
        <p>不要一次背完所有架构。先点左边一个主题，看“直白说法”，再用右侧 PPT 流程练 30 秒表达。</p>
        {architecture ? (
          <div className="resource-angle-list">
            {architecture.interviewAngles.slice(0, 5).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

function MiniFlow({ items }: { items: string[] }) {
  return (
    <div className="mini-flow">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {item}
          {index < items.length - 1 ? <ArrowRight size={12} aria-hidden="true" /> : null}
        </span>
      ))}
    </div>
  );
}

function LoginScreen({ busy, error, onLogin }: { busy: boolean; error: string; onLogin: () => void }) {
  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-block">
          <div className="brand-mark">
            <Boxes size={21} />
          </div>
          <div>
            <strong>FullStack Transition Lab</strong>
            <span>Next.js + Prisma + SQLite</span>
          </div>
        </div>

        <div className="login-copy">
          <h1 id="login-title">前端转全栈训练项目</h1>
          <p>进入后可以看到学习路线、真实 API、登录鉴权、数据库任务、面试题库和 AI 流式接口。</p>
        </div>

        <div className="credential-box">
          <span>演示账号</span>
          <code>frontend@example.com / fullstack123</code>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" type="button" onClick={onLogin} disabled={busy}>
          {busy ? <Loader2 className="spin" size={17} /> : <LockKeyhole size={17} />}
          进入训练台
        </button>
      </section>

      <section className="login-preview" aria-label="项目能力预览">
        <div className="preview-row">
          <Server size={18} />
          <span>REST API / Zod / 错误码</span>
        </div>
        <div className="preview-row">
          <Database size={18} />
          <span>Prisma ORM / 事务 / 索引</span>
        </div>
        <div className="preview-row">
          <ShieldCheck size={18} />
          <span>JWT Cookie / RBAC / 限流</span>
        </div>
        <div className="preview-row">
          <Sparkles size={18} />
          <span>AI 流式响应 / provider 扩展点</span>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  helper,
  icon,
  tone
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone: "green" | "blue" | "amber" | "teal";
}) {
  return (
    <article className={`metric metric-${tone}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function LessonStepper({
  stages,
  activeStage,
  progress,
  onSelectStage
}: {
  stages: Array<{ key: LessonStageKey; nav: string; icon: React.ReactNode }>;
  activeStage: LessonStageKey;
  progress: number;
  onSelectStage: (stage: LessonStageKey) => void;
}) {
  return (
    <div className="lesson-stepper" aria-label="学习关卡进度">
      <div className="lesson-stepper-top">
        <strong>今日学习路线</strong>
        <span>{progress}%</span>
      </div>
      <div className="lesson-stepper-track">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="lesson-step-list">
        {stages.map((stage, index) => (
          <button
            className={stage.key === activeStage ? "lesson-step active" : "lesson-step"}
            key={stage.key}
            type="button"
            onClick={() => onSelectStage(stage.key)}
          >
            <span>{index + 1}</span>
            <small>{stage.nav}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function StageCoach({ icon, title, points, reward }: { icon: React.ReactNode; title: string; points: string[]; reward: string }) {
  return (
    <aside className="stage-coach" aria-label="本关学习引导">
      <div className="stage-coach-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <p>这关只做下面三件事，做完再进入下一关。</p>
      </div>
      <ol>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ol>
      <span className="stage-reward">
        <Zap size={15} />
        完成本关 {reward}
      </span>
    </aside>
  );
}

function LessonPager({
  currentIndex,
  total,
  reward,
  onPrevious,
  onNext
}: {
  currentIndex: number;
  total: number;
  reward: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="lesson-pager">
      <button className="secondary-button" type="button" onClick={onPrevious} disabled={currentIndex === 0}>
        上一关
      </button>
      <div className="lesson-pager-status">
        <span>第 {currentIndex + 1} / {total} 关</span>
        <strong>完成奖励 +{reward} XP</strong>
      </div>
      <button className="primary-button" type="button" onClick={onNext} disabled={currentIndex === total - 1}>
        下一关
        <ChevronRight size={16} />
      </button>
    </footer>
  );
}

function LearningHero({
  user,
  nextModule,
  overallProgress,
  activeTasks,
  hardQuestions,
  onContinue,
  onPractice
}: {
  user: User;
  nextModule: LearningModule | null;
  overallProgress: number;
  activeTasks: number;
  hardQuestions: number;
  onContinue?: () => void;
  onPractice?: () => void;
}) {
  const todayXp = Math.min(300, 160 + activeTasks * 12 + hardQuestions * 8);
  const xp = 4200 + overallProgress * 42;
  const xpTarget = 7200;
  const xpPercent = Math.min(100, Math.round((xp / xpTarget) * 100));
  const level = Math.max(12, Math.round(overallProgress / 5) + 8);
  const lessonTitle = nextModule?.title ?? "API 合约设计与文档规范";
  const lessonSummary = nextModule?.summary ?? "从接口合同、错误码、数据校验和数据库读写开始，把全栈链路讲清楚。";

  return (
    <section className="hero-quest" aria-labelledby="today-mainline">
      <div className="quest-illustration" aria-hidden="true">
        <div className="code-card">
          <span>{"{ API }"}</span>
          <i />
          <i />
          <i />
        </div>
        <div className="upload-bubble">
          <ArrowRight size={20} />
        </div>
      </div>

      <div className="quest-copy">
        <div className="quest-meta">
          <span>
            <Zap size={16} />
            今日主线
          </span>
          <small>第 23 天</small>
        </div>
        <h2 id="today-mainline">{lessonTitle}</h2>
        <p>{lessonSummary}</p>
        <div className="quest-tags">
          <span>后端基础</span>
          <span>API 设计</span>
          <span>数据库</span>
          <span>面试表达</span>
        </div>
        <div className="quest-actions">
          <button className="primary-button quest-start" type="button" onClick={onContinue}>
            继续学习
            <ChevronRight size={17} />
          </button>
          <button className="ghost-action" type="button" onClick={onPractice}>
            <Play size={16} />
            继续上次：事务日志
          </button>
        </div>
      </div>

      <div className="level-orbit" aria-label={`当前等级 ${level}`}>
        <div className="level-ring" style={{ "--level-progress": `${xpPercent}%` } as React.CSSProperties}>
          <span>当前等级</span>
          <strong>Lv. {level}</strong>
        </div>
        <div className="xp-line">
          <strong>{xp} / {xpTarget} XP</strong>
          <span>
            <i style={{ width: `${xpPercent}%` }} />
          </span>
          <small>再获得 {xpTarget - xp} XP 升级</small>
        </div>
      </div>

      <div className="quest-bottom">
        <span>今日 XP</span>
        <strong>+{todayXp} XP</strong>
        <div className="progress-track">
          <span style={{ width: `${Math.min(100, Math.round((todayXp / 300) * 100))}%` }} />
        </div>
        <span>每日上限：{todayXp} / 300 XP</span>
        <strong className="streak-hot">
          <Zap size={15} />
          连续学习 12 天
        </strong>
      </div>

      <div className="mentor-note">
        <CalendarDays size={15} />
        <span>{user.weeklyHours}h / 周目标，今天先完成一个后端关卡。</span>
      </div>
    </section>
  );
}

function DailyMissionGrid({
  activeTasks,
  hardQuestions,
  overallProgress
}: {
  activeTasks: number;
  hardQuestions: number;
  overallProgress: number;
}) {
  const missions = [
    {
      icon: <Code2 size={22} />,
      title: "完成 1 个代码实验",
      detail: "改一个任务状态，观察 API、事务和日志",
      current: Math.max(0, 1 - Math.min(activeTasks, 1)),
      total: 1,
      xp: 40,
      href: "#tasks",
      tone: "green"
    },
    {
      icon: <BookOpenCheck size={22} />,
      title: "答对 10 道题",
      detail: "把数据库、鉴权和部署讲成面试答案",
      current: Math.max(3, 10 - hardQuestions),
      total: 10,
      xp: 40,
      href: "#interview",
      tone: "blue"
    },
    {
      icon: <Bot size={22} />,
      title: "问 AI Mentor 1 次",
      detail: "让它帮你把今天关卡整理成表达稿",
      current: overallProgress > 40 ? 1 : 0,
      total: 1,
      xp: 20,
      href: "#ai",
      tone: "amber"
    }
  ];

  return (
    <section className="daily-missions" aria-labelledby="daily-missions-title">
      <div className="section-title-row">
        <h2 id="daily-missions-title">今日任务</h2>
        <span>完成任务拿 XP，推动路线解锁</span>
      </div>
      <div className="mission-grid">
        {missions.map((mission) => (
          <a className={`mission-card mission-${mission.tone}`} href={mission.href} key={mission.title}>
            <div className="mission-icon">{mission.icon}</div>
            <div>
              <strong>{mission.title}</strong>
              <p>{mission.detail}</p>
              <div className="mission-progress">
                <span>{mission.current} / {mission.total}</span>
                <i>
                  <b style={{ width: `${Math.min(100, Math.round((mission.current / mission.total) * 100))}%` }} />
                </i>
                <em>+{mission.xp} XP</em>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ProgressSidebar({
  user,
  completedModules,
  moduleCount,
  reviewQuestions,
  questionCount,
  overallProgress
}: {
  user: User;
  completedModules: number;
  moduleCount: number;
  reviewQuestions: number;
  questionCount: number;
  overallProgress: number;
}) {
  const readiness = Math.min(92, Math.max(35, Math.round((overallProgress + (reviewQuestions / Math.max(1, questionCount)) * 100) / 2)));
  const achievements = [
    { icon: <Code2 size={24} />, title: "初露锋芒", detail: `完成 ${completedModules} 个模块`, active: completedModules > 0 },
    { icon: <FlameIcon />, title: "坚持不懈", detail: "连续学习 12 天", active: true },
    { icon: <Trophy size={24} />, title: "全栈起步", detail: "完成 20% 路径", active: overallProgress >= 20 },
    { icon: <Lock size={24} />, title: "更多成就", detail: "敬请期待", active: false }
  ];

  return (
    <aside className="progress-rail" aria-label="学习进度侧栏">
      <section className="learner-card">
        <div className="avatar-chip">
          <span>{user.name.slice(0, 1)}</span>
        </div>
        <div>
          <strong>{user.name}</strong>
          <small>{user.level}</small>
          <div className="mini-xp">
            <i style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <span className="level-badge">Lv. {Math.max(12, Math.round(overallProgress / 5) + 8)}</span>
      </section>

      <section className="weekly-goal-card">
        <div className="card-title-line">
          <strong>本周目标</strong>
          <span>设置目标</span>
        </div>
        <div className="goal-line">
          <span>学习 {user.weeklyHours} 小时</span>
          <strong>{Math.round(user.weeklyHours * 0.62)} / {user.weeklyHours} 小时</strong>
        </div>
        <div className="wide-progress">
          <i style={{ width: "62%" }} />
        </div>
        <div className="week-dots">
          {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
            <span className={index < 5 ? "checked" : undefined} key={day}>
              {day}
            </span>
          ))}
        </div>
      </section>

      <section className="achievement-card">
        <div className="card-title-line">
          <strong>成就徽章</strong>
          <span>查看全部</span>
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <article className={achievement.active ? "achievement active" : "achievement"} key={achievement.title}>
              <div>{achievement.icon}</div>
              <strong>{achievement.title}</strong>
              <small>{achievement.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="readiness-card">
        <div className="readiness-gauge" style={{ "--ready": `${readiness}%` } as React.CSSProperties}>
          <strong>{readiness}%</strong>
          <span>面试准备度</span>
        </div>
        <div className="readiness-list">
          <span><CheckCircle2 size={14} /> 架构表达 {overallProgress}%</span>
          <span><CheckCircle2 size={14} /> 项目实战 {completedModules}/{moduleCount}</span>
          <span><CircleDot size={14} /> 高阶题复盘 {reviewQuestions}/{questionCount}</span>
        </div>
        <a className="secondary-button full-width" href="#architecture">
          开始专项提升
          <ChevronRight size={16} />
        </a>
      </section>
    </aside>
  );
}

function FlameIcon() {
  return <Zap size={24} />;
}

function LearningRoadmap({ modules, nextModuleId }: { modules: LearningModule[]; nextModuleId?: string }) {
  return (
    <section className="panel lesson-path-panel" id="lesson-path">
      <PanelHeader icon={<Code2 size={18} />} title="学习路径" action="按解锁顺序闯关" />
      <div className="roadmap-list quest-path">
        {modules.map((module) => (
          <article className={`roadmap-item quest-node ${module.id === nextModuleId ? "current" : ""}`} key={module.id}>
            <div className="roadmap-sequence">
              {module.status === "DONE" ? <CheckCircle2 size={18} /> : module.status === "LOCKED" ? <Lock size={16} /> : module.sequence}
            </div>
            <div className="roadmap-content">
              <div className="row-between">
                <strong>{module.title}</strong>
                <span className={`status-pill status-${module.status.toLowerCase()}`}>{statusLabel[module.status] ?? module.status}</span>
              </div>
              <p>{module.summary}</p>
              <div className="progress-track" aria-label={`${module.title} 进度 ${module.progress}%`}>
                <span style={{ width: `${module.progress}%` }} />
              </div>
              <small>{module.interviewFocus}</small>
            </div>
            <ChevronRight size={18} aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

function TaskBoard({
  tasks,
  keyword,
  statusFilter,
  onKeywordChange,
  onStatusChange,
  onSearch,
  onTaskStatusChange,
  onCreateTask
}: {
  tasks: TaskResponse;
  keyword: string;
  statusFilter: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onCreateTask: (input: { title: string; description: string; type: string; priority: string; storyPoints: number }) => void;
}) {
  const [form, setForm] = useState({
    title: "新增一个后端面试训练任务",
    description: "要求能在面试里讲清需求、接口、数据模型、错误处理和测试方式。",
    type: "BACKEND",
    priority: "MEDIUM",
    storyPoints: 3
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreateTask(form);
  }

  return (
    <section className="panel" id="tasks">
      <PanelHeader icon={<ClipboardList size={18} />} title="项目任务与 CRUD" action={`${tasks.meta.total} 条任务`} />
      <div className="task-toolbar">
        <label className="input-with-icon">
          <Search size={15} />
          <input value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="任务搜索" />
        </label>
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} aria-label="任务状态筛选">
          <option value="ALL">全部状态</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>
        <button className="secondary-button" type="button" onClick={onSearch}>
          <Search size={15} />
          查询
        </button>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>任务</th>
              <th>类型</th>
              <th>优先级</th>
              <th>状态</th>
              <th>分支</th>
            </tr>
          </thead>
          <tbody>
            {tasks.items.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <span>{task.description}</span>
                </td>
                <td>{typeLabel[task.type] ?? task.type}</td>
                <td>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>{priorityLabel[task.priority] ?? task.priority}</span>
                </td>
                <td>
                  <select value={task.status} onChange={(event) => onTaskStatusChange(task.id, event.target.value)} aria-label={`修改 ${task.title} 状态`}>
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <code>{task.branch}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="quick-task-form" onSubmit={submit}>
        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} aria-label="任务标题" />
        <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} aria-label="任务描述" />
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} aria-label="任务类型">
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {typeLabel[type]}
            </option>
          ))}
        </select>
        <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} aria-label="任务优先级">
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
          <option value="CRITICAL">紧急</option>
        </select>
        <button className="primary-button compact" type="submit">
          <Plus size={15} />
          新建
        </button>
      </form>
    </section>
  );
}

function ApiPractice() {
  const endpoints = [
    { label: "学习模块", method: "GET", path: "/api/learning/modules" },
    { label: "任务分页", method: "GET", path: "/api/tasks?page=1&pageSize=3" },
    { label: "系统设计", method: "GET", path: "/api/system-design" },
    { label: "后端日志", method: "GET", path: "/api/logs" }
  ];
  const [active, setActive] = useState(endpoints[0]);
  const [result, setResult] = useState("点击运行，观察统一响应结构。");
  const [busy, setBusy] = useState(false);

  async function run(endpoint = active) {
    setActive(endpoint);
    setBusy(true);

    try {
      const response = await fetch(endpoint.path);
      const json = await response.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "接口请求失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" id="api">
      <PanelHeader icon={<TerminalSquare size={18} />} title="API Explorer" action="统一响应 / 错误码" />
      <div className="endpoint-list">
        {endpoints.map((endpoint) => (
          <button key={endpoint.path} className={active.path === endpoint.path ? "endpoint active" : "endpoint"} type="button" onClick={() => run(endpoint)}>
            <span>{endpoint.method}</span>
            <strong>{endpoint.label}</strong>
          </button>
        ))}
      </div>
      <button className="primary-button full" type="button" onClick={() => run()} disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
        运行当前接口
      </button>
      <pre className="api-result">{result}</pre>
    </section>
  );
}

function InterviewChecklist({ questions }: { questions: InterviewQuestion[] }) {
  return (
    <section className="panel" id="interview">
      <PanelHeader icon={<ListChecks size={18} />} title="主流面试题清单" action="项目内可对应" />
      <div className="question-list">
        {questions.map((question) => (
          <article className="question-item" key={question.id}>
            <div className="row-between">
              <span>{question.category}</span>
              <strong>{question.difficulty}</strong>
            </div>
            <p>{question.title}</p>
            <small>{question.answerHint}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function AiMentor() {
  const [prompt, setPrompt] = useState("我前端经验比较多，面试时怎么讲这个项目里的后端能力？");
  const [focus, setFocus] = useState("interview");
  const [answer, setAnswer] = useState("等待流式输出。");
  const [busy, setBusy] = useState(false);

  async function askMentor() {
    setBusy(true);
    setAnswer("");

    try {
      const response = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, focus })
      });

      if (!response.ok || !response.body) {
        const json = (await response.json()) as ApiEnvelope<unknown>;
        throw new Error(json.ok ? "AI Mentor 请求失败" : json.error.message);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        setAnswer((current) => current + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "AI Mentor 请求失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" id="ai">
      <PanelHeader icon={<Bot size={18} />} title="AI Mentor" action="本地流式模拟" />
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="AI Mentor 问题" />
      <div className="mentor-controls">
        <select value={focus} onChange={(event) => setFocus(event.target.value)} aria-label="AI Mentor 关注点">
          <option value="roadmap">学习路线</option>
          <option value="interview">面试表达</option>
          <option value="backend">后端工程</option>
          <option value="system-design">系统设计</option>
          <option value="ai">AI 工程化</option>
        </select>
        <button className="primary-button" type="button" onClick={askMentor} disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          生成建议
        </button>
      </div>
      <pre className="mentor-answer">{answer}</pre>
    </section>
  );
}

function ArchitecturePanel({ architecture }: { architecture: Architecture | null }) {
  if (!architecture) {
    return null;
  }

  return (
    <section className="panel">
      <PanelHeader icon={<Server size={18} />} title="系统设计表达" action="从请求到数据库" />
      <div className="path-line">
        {architecture.requestPath.map((item, index) => (
          <span key={item}>
            {item}
            {index < architecture.requestPath.length - 1 ? <ArrowRight size={13} /> : null}
          </span>
        ))}
      </div>
      <div className="architecture-list">
        {architecture.modules.map((item) => (
          <article key={item.name}>
            <strong>{item.name}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivityLog({ logs, onRefresh }: { logs: BackendLog[]; onRefresh: () => void }) {
  return (
    <section className="panel">
      <PanelHeader
        icon={<Activity size={18} />}
        title="后端日志"
        action={
          <button className="link-button" type="button" onClick={onRefresh}>
            刷新
          </button>
        }
      />
      <div className="log-list">
        {logs.map((log) => (
          <article className="log-row" key={log.id}>
            <span className={`log-level level-${log.level.toLowerCase()}`}>{log.level}</span>
            <div>
              <strong>{log.service}</strong>
              <p>{log.message}</p>
            </div>
            <time>{formatTime(log.createdAt)}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="panel-header">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      {action ? <span className="panel-action">{action}</span> : null}
    </div>
  );
}

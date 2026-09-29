import { TRPCError } from "@trpc/server";

export type HeartbeatJob = {
  name: string;
  /**
   * 6-field cron with seconds (`sec min hour dom mon dow`), UTC.
   * Use `0` for the seconds field — e.g. `"0 0 9 * * *"` is daily 09:00 UTC.
   */
  cron: string;
  /** Callback path. MUST start with `/api/scheduled/`. */
  path: string;
  method?: "POST" | "PUT";
  payload?: unknown;
  description?: string;
};

export type HeartbeatJobUpdate = Partial<Omit<HeartbeatJob, "name">> & {
  enable?: boolean;
};

export type HeartbeatJobInfo = {
  taskUid: string;
  name: string;
  userId: string;
  description: string;
  cronExpression: string;
  callbackPath: string;
  callbackMethod: string;
  callbackPayload: string;
  isEnable: boolean;
  createdAt?: string | null;
  lastExecutedAt?: string | null;
  nextExecutionAt?: string | null;
};

const stringifyPayload = (payload: unknown): string => {
  if (payload === undefined || payload === null) return "{}";
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload);
};

const validateCallbackPath = (path: string): void => {
  if (!path || !path.startsWith("/api/scheduled/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "callback path must start with /api/scheduled/",
    });
  }
};

/**
 * Scheduled workers run in-process (see the `register*` calls in
 * `server/_core/index.ts`), so this registry only records which schedules have
 * been enabled from the admin UI and hands back a stable identifier for the
 * business rows that reference it. The cron expression is retained for display.
 */
const jobs = new Map<string, HeartbeatJobInfo>();

const taskUidFor = (name: string) => `sched-${name}`;

export async function createHeartbeatJob(
  job: HeartbeatJob
): Promise<{ taskUid: string; nextExecutionAt?: string | null }> {
  validateCallbackPath(job.path);
  const taskUid = taskUidFor(job.name);
  jobs.set(taskUid, {
    taskUid,
    name: job.name,
    userId: "local",
    description: job.description ?? "",
    cronExpression: job.cron,
    callbackPath: job.path,
    callbackMethod: job.method ?? "POST",
    callbackPayload: stringifyPayload(job.payload),
    isEnable: true,
    createdAt: new Date().toISOString(),
    lastExecutedAt: null,
    nextExecutionAt: null,
  });
  return { taskUid, nextExecutionAt: null };
}

export async function updateHeartbeatJob(
  taskUid: string,
  patch: HeartbeatJobUpdate
): Promise<{ nextExecutionAt?: string | null }> {
  if (patch.path !== undefined) validateCallbackPath(patch.path);
  const existing = jobs.get(taskUid);
  if (existing) {
    jobs.set(taskUid, {
      ...existing,
      cronExpression: patch.cron ?? existing.cronExpression,
      callbackPath: patch.path ?? existing.callbackPath,
      callbackMethod: patch.method ?? existing.callbackMethod,
      callbackPayload:
        patch.payload === undefined
          ? existing.callbackPayload
          : stringifyPayload(patch.payload),
      description: patch.description ?? existing.description,
      isEnable: patch.enable ?? existing.isEnable,
    });
  }
  return { nextExecutionAt: null };
}

export async function deleteHeartbeatJob(taskUid: string): Promise<void> {
  jobs.delete(taskUid);
}

export async function listHeartbeatJobs(): Promise<{
  total: number;
  actorUserId: string;
  jobs: HeartbeatJobInfo[];
}> {
  const all = Array.from(jobs.values());
  return { total: all.length, actorUserId: "local", jobs: all };
}

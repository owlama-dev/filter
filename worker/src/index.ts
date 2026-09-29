import http from "node:http";
import { pool, q, sleep } from "./db";
import { env } from "./env";
import { startOnchainIngest } from "./ingest/onchain";
import { startTelegramIngest } from "./ingest/telegram";
import { handleOutcome } from "./outcomes";
import { handleEvaluate } from "./pipeline";
import { flushHealth } from "./providers/http";
import { claim, complete, depth, fail, maintain, type Job } from "./queue";
import { recomputeReputation } from "./reputation";
import { getEngine } from "./settings";

let stopping = false;
let inflight = 0;
const startedAt = Date.now();

async function run(job: Job) {
  try {
    if (job.kind === "evaluate") await handleEvaluate(job.payload as never);
    else if (job.kind === "outcome") await handleOutcome(job.payload as never);
    await complete(job.id);
  } catch (err) {
    console.error(`[job ${job.id} ${job.kind}]`, err instanceof Error ? err.message : err);
    await fail(job, err);
  }
}

async function workerLoop() {
  while (!stopping) {
    const engine = await getEngine().catch(() => null);
    if (!engine || engine.paused) {
      await sleep(2000);
      continue;
    }
    const free = engine.max_inflight - inflight;
    if (free <= 0) {
      await sleep(200);
      continue;
    }
    const jobs = await claim(["evaluate", "outcome"], free).catch((e) => {
      console.error("[claim]", e instanceof Error ? e.message : e);
      return [] as Job[];
    });
    if (!jobs.length) {
      await sleep(700);
      continue;
    }
    for (const job of jobs) {
      inflight += 1;
      void run(job).finally(() => {
        inflight -= 1;
      });
    }
  }
}

async function main() {
  await q("select 1"); // fail fast if the database is unreachable
  console.log("[worker] starting");

  startOnchainIngest(() => stopping);
  const tg = await startTelegramIngest().catch((e) => {
    console.error("[telegram] failed to start:", e instanceof Error ? e.message : e);
    return null;
  });

  const maint = setInterval(() => void maintain().catch(() => undefined), 60_000);
  const health = setInterval(() => void flushHealth().catch(() => undefined), 15_000);
  const reputation = setInterval(() => void recomputeReputation().catch((e) => console.error("[reputation]", e)), 10 * 60_000);
  void recomputeReputation().catch(() => undefined);
  void workerLoop();

  const server = http
    .createServer(async (req, res) => {
      if (req.url !== "/healthz") {
        res.writeHead(404).end();
        return;
      }
      const [ingestion] = await q<{ callsCaptured: number; lastCallAt: string | null }>(
        `select count(*)::int as "callsCaptured", max(received_at)::text as "lastCallAt" from messages`,
      ).catch(() => [{ callsCaptured: -1, lastCallAt: null }]);
      const body = {
        ok: true,
        inflight,
        queueDepth: await depth().catch(() => -1),
        uptimeSec: Math.round((Date.now() - startedAt) / 1000),
        telegram: {
          configured: Boolean(env.TELEGRAM_API_ID && env.TELEGRAM_API_HASH && env.TELEGRAM_SESSION),
          connected: tg != null,
          enabledSources: tg?.enabledSourceCount() ?? 0,
        },
        ingestion,
      };
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(body));
    })
    .listen(env.PORT);

  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    console.log("[worker] shutting down");
    clearInterval(maint);
    clearInterval(health);
    clearInterval(reputation);
    server.close();
    await tg?.stop().catch(() => undefined);
    for (let i = 0; i < 50 && inflight > 0; i += 1) await sleep(200); // drain in-flight jobs
    await pool.end();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

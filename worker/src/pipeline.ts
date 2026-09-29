import { scoreToken } from "../../src/lib/alpha/scoring";
import type { KillRules, OnchainFacts, Weights } from "../../src/lib/alpha/types";
import { sendAlert } from "./alerts";
import { notify, q } from "./db";
import { getPairs, metricsFromPair, pickPair } from "./providers/dexscreener";
import { traceBundle } from "./providers/bundles";
import { traceDeployer } from "./providers/deployer";
import { readMint } from "./providers/rpc";
import { enqueue } from "./queue";
import { getEngine } from "./settings";

interface ConfigRow {
  version: number;
  weights: Weights;
  threshold: number;
  kill_rules: KillRules;
}

const HORIZONS_MIN = [15, 60, 240, 1440];
function emptyOnchain() {
  return {
    mintAuthority: undefined,
    freezeAuthority: undefined,
    decimals: null,
    supply: null,
    tokenProgram: null,
    topHolders: [] as OnchainFacts["topHolders"],
    holderCoveragePct: null,
    queriedAt: null,
  };
}

export async function handleEvaluate(payload: { address: string; sourceId?: string; messageId?: number }) {
  const { address } = payload;

  const [cfg] = await q<ConfigRow>("select version, weights, threshold, kill_rules from scoring_configs where is_active");
  if (!cfg) throw new Error("no active scoring config (run migrations)");

  // Several channels often post the same mint within seconds; evaluate once.
  const recent = await q(
    "select 1 from evaluations where token_address = $1 and created_at > now() - interval '10 minutes' and status <> 'error' limit 1",
    [address],
  );
  if (recent.length) return;

  await q(
    `insert into tokens (address, first_source_id, first_message_id)
     values ($1, $2, $3) on conflict (address) do nothing`,
    [address, payload.sourceId ?? null, payload.messageId ?? null],
  );
  const [ev] = await q<{ id: number }>(
    "insert into evaluations (token_address, config_version, status) values ($1, $2, 'enriching') returning id",
    [address, cfg.version],
  );
  const evalId = ev!.id;

  try {
    const [pairsRes, onchainRes, deployerRes, bundleRes] = await Promise.allSettled([
      getPairs(address),
      readMint(address),
      traceDeployer(address),
      traceBundle(address),
    ]);
    const pair = pairsRes.status === "fulfilled" ? pickPair(address, pairsRes.value) : null;
    const market = metricsFromPair(pair);
    const onchainFacts = onchainRes.status === "fulfilled" ? onchainRes.value : emptyOnchain();
    const onchain = {
      ...onchainFacts,
      deployer: deployerRes.status === "fulfilled" ? deployerRes.value : null,
      bundle: bundleRes.status === "fulfilled" ? bundleRes.value : null,
    };

    if (pair) {
      const base = pair.baseToken.address === address ? pair.baseToken : pair.quoteToken;
      await q("update tokens set name = $2, symbol = $3 where address = $1", [address, base.name, base.symbol]);
    }

    const analysis = scoreToken({ market, onchain, status: "scored" }, cfg.weights, cfg.threshold, cfg.kill_rules);

    await q(
      `update evaluations set status = $2, score = $3, passed = $4, market = $5::jsonb,
         onchain = $6::jsonb, analysis = $7::jsonb, finished_at = now() where id = $1`,
      [
        evalId,
        analysis.passed ? "passed" : "rejected",
        analysis.total,
        analysis.passed,
        JSON.stringify(market),
        JSON.stringify(onchain),
        JSON.stringify(analysis),
      ],
    );
    await notify("alpha_events", { type: "evaluation", evaluationId: evalId, address, passed: analysis.passed });

    if (analysis.passed) {
      const engine = await getEngine();
      if (!engine.safe_mode) {
        const [src] = await q<{ title: string; weight: number }>(
          `select s.title, s.weight from tokens t join sources s on s.id = t.first_source_id where t.address = $1`,
          [address],
        );
        // A source with a weak track record needs a materially stronger score to
        // still fire an alert; a strong one gets a small allowance. This never
        // touches the stored score — only whether the alert goes out.
        const weight = src?.weight ?? 1;
        const alertBar = cfg.threshold + (1 - weight) * 10;
        if (analysis.total >= alertBar) {
          await sendAlert({
            symbol: pair?.baseToken.symbol ?? address.slice(0, 6),
            name: pair?.baseToken.name ?? "Unknown",
            address,
            score: analysis.total,
            threshold: cfg.threshold,
            mcapUsd: market.mcapUsd,
            liquidityUsd: market.liquidityUsd,
            pairUrl: market.pairUrl,
            topReasons: analysis.parts
              .slice()
              .sort((a, b) => b.points - a.points)
              .map((p) => `${p.label}: ${p.reason}`),
            sourceTitle: src?.title ?? null,
          }).catch((e) => console.error("[alert]", e instanceof Error ? e.message : e));
        }
      }
    }

    // Track what actually happened so sources and weights can be judged on outcomes.
    if (market.priceUsd != null) {
      for (const h of HORIZONS_MIN) await enqueue("outcome", { address, evalId, horizonMin: h }, h * 60);
    }
  } catch (err) {
    await q("update evaluations set status = 'error', error = $2, finished_at = now() where id = $1", [
      evalId,
      (err instanceof Error ? err.message : String(err)).slice(0, 500),
    ]);
    throw err;
  }
}

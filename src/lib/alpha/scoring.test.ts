import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_KILL_RULES } from "./defaults.ts";
import { scoreToken } from "./scoring.ts";

test("scoreToken records real on-chain data and real kill rules without modeled placeholders", () => {
  const analysis = scoreToken(
    {
      status: "scored",
      market: {
        priceUsd: 1,
        liquidityUsd: 12000,
        volume24h: 4000,
        volume1h: 600,
        volume5m: 150,
        mcapUsd: 70000,
        fdvUsd: 80000,
        buys24h: 120,
        sells24h: 20,
        buyers24h: 80,
        sellers24h: 15,
        buyers1h: 42,
        buys1h: 96,
        sells1h: 18,
        pairAgeMin: 30,
        dexId: "raydium",
        pairAddress: "abc",
        pairUrl: "https://example.test",
        priceChange24h: 5,
      },
      onchain: {
        mintAuthority: null,
        freezeAuthority: null,
        decimals: 9,
        supply: "1000000000000",
        tokenProgram: "Tokenkeg...",
        topHolders: [
          { address: "A", pct: 12, uiAmount: 12, owner: "ownerA", clusterPct: 12 },
          { address: "B", pct: 8, uiAmount: 8, owner: "ownerA", clusterPct: 12 },
          { address: "C", pct: 5, uiAmount: 5, owner: "ownerB", clusterPct: 5 },
        ],
        holderCoveragePct: 25,
        queriedAt: Date.now(),
        deployer: {
          wallet: "11111111111111111111111111111112",
          walletAgeDays: 4,
          walletTxCount: 10,
          priorMintCount: 2,
          priorRugCount: 3,
          tracedAt: Date.now(),
        },
        bundle: {
          creationSlot: 123,
          earlyTxCount: 8,
          sameSlotTxCount: 5,
          sameSlotPct: 62.5,
          tracedAt: Date.now(),
        },
        freshWallets: {
          earlyBuyerCount: 10,
          freshBuyerCount: 7,
          freshRatioPct: 70,
          fundedAgeDaysMedian: 3,
          tracedAt: Date.now(),
        },
        lp: {
          poolAddress: "poolabc",
          dexId: "raydium",
          poolAccountOwner: "owner",
          poolAccountReadable: true,
          reserveTokenAccounts: 2,
          lpMint: null,
          burnedOrLockedPct: null,
          tracedAt: Date.now(),
        },
      },
    },
    undefined,
    72,
    {
      ...DEFAULT_KILL_RULES,
      maxDeployerPriorRugs: 2,
      maxSameSlotBundlePct: 55,
    },
  );

  const deployer = analysis.parts.find((part) => part.key === "deployer");
  const bundle = analysis.parts.find((part) => part.key === "bundles");
  const fresh = analysis.parts.find((part) => part.key === "freshWallets");
  const lp = analysis.parts.find((part) => part.key === "lpLock");

  assert.equal(deployer?.source, "onchain");
  assert.equal(bundle?.source, "onchain");
  assert.equal(fresh?.source, "onchain");
  assert.equal(lp?.source, "onchain");

  assert.equal(
    analysis.killFlags.some((flag) => flag.code === "SERIAL_RUGGER" && flag.detail.includes("3 times")),
    true,
  );
  assert.equal(
    analysis.killFlags.some((flag) => flag.code === "BUNDLE_LAUNCH" && flag.detail.includes("63%")),
    true,
  );

  const checklist = new Map(analysis.checklist.map((item) => [item.id, item]));
  assert.equal(checklist.get("deployer")?.done, true);
  assert.equal(checklist.get("bundle")?.done, true);
  assert.equal(checklist.get("fresh")?.done, true);
  assert.equal(checklist.get("lp")?.done, true);
  assert.equal(checklist.get("holders")?.done, true);
  assert.equal(analysis.passed, false);
});

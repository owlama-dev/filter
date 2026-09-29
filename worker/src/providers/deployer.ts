import type { DeployerTrail } from "../../../src/lib/alpha/types";
import { q } from "../db";
import { getSignatures, rpcCall } from "./signatures";

type Tx = {
  transaction?: { message?: { accountKeys?: (string | { pubkey: string; signer?: boolean })[] } };
  blockTime?: number | null;
};

function feePayerOf(tx: Tx | null): string | null {
  const keys = tx?.transaction?.message?.accountKeys;
  if (!keys?.length) return null;
  const first = keys[0];
  return typeof first === "string" ? first : (first?.pubkey ?? null);
}

/**
 * Walks the mint's own transaction history back to its earliest signature (the
 * create/initialize-mint tx) to find the fee payer, treats that as the deployer
 * wallet, then checks our own dev_wallets ledger for that wallet's track record.
 * This is a real on-chain trace, not a market-derived proxy — but the "prior
 * launches" count is only as complete as our own ledger, built up over time as
 * the scanner itself observes new mints from this wallet.
 */
export async function traceDeployer(mintAddress: string): Promise<DeployerTrail | null> {
  try {
    const sigs = await getSignatures(mintAddress, 1000);
    if (!sigs.length) return null;
    const earliest = sigs[sigs.length - 1]!; // getSignaturesForAddress is newest-first
    const tx = await rpcCall<Tx | null>("getTransaction", [
      earliest.signature,
      { maxSupportedTransactionVersion: 0, encoding: "json" },
    ]);
    const wallet = feePayerOf(tx);
    if (!wallet) return null;

    let walletAgeDays: number | null = null;
    let walletTxCount: number | null = null;
    try {
      const walletSigs = await getSignatures(wallet, 1000);
      walletTxCount = walletSigs.length;
      const oldest = walletSigs[walletSigs.length - 1];
      if (oldest?.blockTime) walletAgeDays = (Date.now() / 1000 - oldest.blockTime) / 86400;
    } catch {
      // wallet history is best-effort; the ledger lookup below still works
    }

    const [row] = await q<{ mint_count: number; rug_count: number }>(
      "select mint_count, rug_count from dev_wallets where wallet = $1",
      [wallet],
    );
    await q(
      `insert into dev_wallets (wallet, tx_count, mint_count) values ($1, $2, 1)
       on conflict (wallet) do update set tx_count = coalesce(excluded.tx_count, dev_wallets.tx_count),
         mint_count = dev_wallets.mint_count + 1, updated_at = now()`,
      [wallet, walletTxCount],
    );
    await q("update tokens set deployer_wallet = $2 where address = $1", [mintAddress, wallet]);

    return {
      wallet,
      walletAgeDays,
      walletTxCount,
      priorMintCount: row?.mint_count ?? 0, // count BEFORE this insert, i.e. prior launches
      priorRugCount: row?.rug_count ?? 0,
      tracedAt: Date.now(),
    };
  } catch {
    return null; // best-effort: scoring falls back to the market-proxy heuristic
  }
}

/** Called by the outcome tracker when a token is confirmed rugged, to update the deployer's record. */
export async function markDeployerRug(mintAddress: string) {
  const [row] = await q<{ deployer_wallet: string | null }>("select deployer_wallet from tokens where address = $1", [
    mintAddress,
  ]);
  if (!row?.deployer_wallet) return;
  await q("update dev_wallets set rug_count = rug_count + 1, updated_at = now() where wallet = $1", [
    row.deployer_wallet,
  ]);
}

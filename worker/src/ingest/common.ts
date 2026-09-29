import { notify, q } from "../db";
import { enqueue } from "../queue";
import { getEngine } from "../settings";

/**
 * Single entry point for every source. Idempotent: (source_id, external_id)
 * is unique, so replays and reconnects never double-evaluate a call.
 */
export async function recordCall(input: {
  sourceId: string;
  externalId: string;
  body: string;
  addresses: string[];
}): Promise<number> {
  if (!input.addresses.length) return 0;
  const engine = await getEngine();
  if (engine.paused) return 0;

  const rows = await q<{ id: number }>(
    `insert into messages (source_id, external_id, body) values ($1, $2, $3)
     on conflict (source_id, external_id) do nothing returning id`,
    [input.sourceId, input.externalId, input.body.slice(0, 4000)],
  );
  const messageId = rows[0]?.id;
  if (!messageId) return 0; // duplicate

  await q("update sources set last_seen_at = now(), last_error = null where id = $1", [input.sourceId]);
  for (const address of input.addresses.slice(0, 5)) {
    await q(
      `insert into tokens (address, first_source_id, first_message_id) values ($1, $2, $3)
       on conflict (address) do nothing`,
      [address, input.sourceId, messageId],
    );
    await q("insert into mentions (message_id, token_address) values ($1, $2) on conflict do nothing", [
      messageId,
      address,
    ]);
    await enqueue("evaluate", { address, sourceId: input.sourceId, messageId });
  }
  await notify("alpha_events", { type: "call", sourceId: input.sourceId, count: input.addresses.length });
  return input.addresses.length;
}

export async function markSourceError(sourceId: string, message: string) {
  await q("update sources set error_count = error_count + 1, last_error = $2 where id = $1", [
    sourceId,
    message.slice(0, 300),
  ]);
}

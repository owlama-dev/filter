import { QUOTE_MINTS, SOLANA_CA_RE } from "./defaults";

export function isSolanaMint(value: string) {
  const v = value.trim();
  if (v.length < 32 || v.length > 44) return false;
  if (QUOTE_MINTS.has(v)) return false;
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(v)) return false;
  return true;
}

export function extractMints(text: string): string[] {
  const found = text.match(SOLANA_CA_RE) ?? [];
  const unique: string[] = [];
  for (const raw of found) {
    if (!isSolanaMint(raw)) continue;
    if (unique.includes(raw)) continue;
    unique.push(raw);
  }
  return unique;
}

export function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
}

import { createFileRoute } from "@tanstack/react-router";
import { WEIGHT_META } from "@/lib/alpha/defaults";
import { useAlpha } from "@/lib/alpha/store";
import type { WeightKey } from "@/lib/alpha/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const KEYS = Object.keys(WEIGHT_META) as WeightKey[];

function SettingsPage() {
  const weights = useAlpha((s) => s.weights);
  const threshold = useAlpha((s) => s.threshold);
  const running = useAlpha((s) => s.running);
  const feedMs = useAlpha((s) => s.feedMs);
  const setWeight = useAlpha((s) => s.setWeight);
  const setThreshold = useAlpha((s) => s.setThreshold);
  const setRunning = useAlpha((s) => s.setRunning);
  const setFeedMs = useAlpha((s) => s.setFeedMs);
  const resetWeights = useAlpha((s) => s.resetWeights);
  const resetDemo = useAlpha((s) => s.resetDemo);
  const sum = KEYS.reduce((s, k) => s + weights[k], 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-wide text-muted uppercase">Filter</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Weights are normalized to 100 at score time. Kill flags still override a high total.
        </p>
      </header>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Live ingest</h2>
            <p className="text-xs text-muted">Pull new Solana pools from GeckoTerminal.</p>
          </div>
          <Switch checked={running} onCheckedChange={setRunning} />
        </div>
        <Label>Alert spacing · {(feedMs / 1000).toFixed(1)}s</Label>
        <Slider className="mt-3" min={2500} max={16000} step={500} value={[feedMs]} onValueChange={(v) => setFeedMs(v[0] ?? feedMs)} />
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-medium">Pass threshold</h2>
          <span className="font-mono text-sm tabular">{threshold}</span>
        </div>
        <Slider min={40} max={90} step={1} value={[threshold]} onValueChange={(v) => setThreshold(v[0] ?? threshold)} />
        <p className="mt-2 text-xs text-muted">Tokens at or above this score, with no kill flag, are marked Potential Good.</p>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Weights</h2>
          <span className="font-mono text-xs text-muted">raw sum {sum}</span>
        </div>
        <div className="space-y-5">
          {KEYS.map((key) => (
            <div key={key}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm">{WEIGHT_META[key].label}</p>
                  <p className="text-xs text-muted">{WEIGHT_META[key].blurb}</p>
                </div>
                <span className="font-mono text-xs tabular">{weights[key]}</span>
              </div>
              <Slider min={0} max={30} step={1} value={[weights[key]]} onValueChange={(v) => setWeight(key, v[0] ?? 0)} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetWeights}>Reset weights</Button>
          <Button variant="outline" onClick={resetDemo}>Clear desk</Button>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)] sm:p-5">
        <h2 className="mb-2 text-sm font-medium text-fg">What is real</h2>
        <p>
          Market tape comes from the active source feed you configure for this desk. Mint and freeze authorities are read from Solana RPC when available. Holder maps use the largest-account call when the source exposes it. Deployer and same-block bundle checks stay modeled when the feed does not provide them, so the desk stays honest.
        </p>
      </section>
    </div>
  );
}

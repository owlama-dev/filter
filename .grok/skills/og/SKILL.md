# OG / brand-card pass

The card pass owns the app's share-card and X feed card assets, plus the explicit `src/lib/og/site.json` contract. The task marks work in progress at `/workspace/.grok/og-pending` and must refresh it while generating; if the marker is older than 10 minutes, the next gate treats it as stale and re-raises the warning.

## Brand-asset pass:

For a real brand app, launch a `task` subagent to generate the card art and keep building while it runs. This pass is intentionally not blocking the main work. `No wait_tasks`, never `get_task_output` on it — consuming a task's output suppresses its completion notification and hides the failure from the agent; answer without it, one sentence more when it wakes you, and keep the preview on the placeholder card until it finishes.

Use a local self-check while the pass is running:

```bash
node scripts/brand-check.mjs --game --root /workspace
node scripts/brand-check.mjs --placeholder-ok --root /workspace
```

When the pass is ready to publish each asset, hand it over atomically:

```bash
node scripts/write-atomic.mjs .grok/og.jpg.tmp public/og.jpg
node scripts/write-atomic.mjs .grok/x-banner.jpg.tmp public/x-banner.jpg
node scripts/write-atomic.mjs .grok/site.json.tmp src/lib/og/site.json
```

The pass is done only when the card, X banner, and `site.json` flags match the app's real identity. Keep the card under 600 KB and prefer JPEG output (`ffmpeg -q:v 4`) for the 1200x630 share card.

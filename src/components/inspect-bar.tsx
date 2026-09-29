import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { isSolanaMint } from "@/lib/alpha/extract";
import { useAlpha } from "@/lib/alpha/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InspectBar() {
  const [value, setValue] = useState("");
  const inspectAddress = useAlpha((s) => s.inspectAddress);
  const inspectBusy = useAlpha((s) => s.inspectBusy);
  const navigate = useNavigate();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const address = value.trim();
    if (!isSolanaMint(address)) {
      toast("Paste a Solana mint (32–44 base58).");
      return;
    }
    const id = inspectAddress(address);
    if (!id) {
      toast("Could not queue that mint.");
      return;
    }
    setValue("");
    void navigate({ to: "/token/$address", params: { address } });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a Solana contract to run the filter"
          className="pl-10 font-mono text-xs sm:text-sm"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" disabled={inspectBusy} className="min-h-11 px-4">
        {inspectBusy ? "Reading" : "Inspect"}
      </Button>
    </form>
  );
}

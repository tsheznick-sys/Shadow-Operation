import { NextResponse } from "next/server";
import { ledgerLayers, readGlobal } from "@/lib/global-ledger";

export const dynamic = "force-dynamic";

// GET /api/ledger — the Global Live Ledger as JSON.
// Public on purpose: proof you have to ask permission for is not proof.
export async function GET(req: Request) {
  const layers = ledgerLayers();
  if (!layers.public) {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "ledger_private" }, { status: 401 });
    }
  }

  const { lines, totals, latest, source } = await readGlobal();
  return NextResponse.json(
    {
      ok: true,
      source,
      lag_hours: layers.lag_hours,
      show_failures: layers.show_failures,
      generated_at: new Date().toISOString(),
      totals,
      brands: lines,
      latest,
    },
    { headers: { "cache-control": `public, max-age=${layerCache(layers.refresh_seconds)}` } }
  );
}

function layerCache(refresh: number) {
  return Number.isFinite(refresh) && refresh > 0 ? refresh : 60;
}

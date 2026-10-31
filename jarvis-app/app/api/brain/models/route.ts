import { NextResponse } from "next/server";
import { bearered } from "@/lib/cron-auth";
import { CLAUDE_MODELS, GROK_MODELS, listModels, modelId, verifyChoice } from "@/lib/brain";

/**
 * WHAT THE ACCOUNT CAN ACTUALLY CALL — today.
 *
 * Model ids rot. The ones in lib/brain.ts are current at the time of writing, but a retirement is
 * a provider decision, not ours. So instead of trusting a string in a file, this endpoint asks both
 * providers what they serve and reports whether our choices are still in the list.
 *
 *   GET /api/brain/models
 *   Authorization: Bearer $N8N_BRAIN_TOKEN
 *
 * Run it after any provider announcement, and before changing ANTHROPIC_MODEL or GROK_MODEL.
 */
export async function GET(req: Request) {
  const tokenName = (process.env.N8N_BRAIN_TOKEN || "").trim() ? "N8N_BRAIN_TOKEN" : "CRON_SECRET";
  const gate = bearered(req, tokenName);
  if (!gate.ok) return gate.response!;

  const [claude, grok] = await Promise.all([listModels("claude"), listModels("grok")]);

  const lanePicks = {
    quality: modelId(process.env, "script"),
    cheap: modelId(process.env, "classify"),
    deep: modelId(process.env, "deep"),
  };

  const verdicts = {
    claude_quality: verifyChoice(claude, lanePicks.quality.id),
    claude_cheap: verifyChoice(claude, lanePicks.cheap.id),
    claude_deep: verifyChoice(claude, lanePicks.deep.id),
    grok_quality: verifyChoice(grok, GROK_MODELS.quality),
    grok_cheap: verifyChoice(grok, GROK_MODELS.cheap),
  };

  const problems = Object.entries(verdicts)
    .filter(([, v]) => !v.present)
    .map(([k, v]) => `${k}: ${v.note}`);

  return NextResponse.json({
    ok: problems.length === 0,
    checked_at: new Date().toISOString(),
    lanes: {
      quality: { model: lanePicks.quality.id, source: lanePicks.quality.source, for: "script, rank, reframe, chat" },
      cheap: { model: lanePicks.cheap.id, source: lanePicks.cheap.source, for: "classify, extract, route" },
      deep: { model: lanePicks.deep.id, source: lanePicks.deep.source, for: "deep, strategy, plan" },
    },
    defaults: { claude: CLAUDE_MODELS, grok: GROK_MODELS },
    catalog: {
      claude: { source: claude.source, count: claude.models.length, error: claude.error ?? null, ids: claude.models.map((m) => m.id) },
      grok: { source: grok.source, count: grok.models.length, error: grok.error ?? null, ids: grok.models.map((m) => m.id) },
    },
    verdicts,
    problems,
    note: problems.length
      ? "A configured model is not in the live catalog. Update ANTHROPIC_MODEL / GROK_MODEL."
      : "Every configured model is present in the live catalog.",
  });
}

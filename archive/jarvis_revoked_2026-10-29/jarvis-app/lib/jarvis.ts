// JARVIS brain — cloud-only fast (Q8) — gpt-4o-mini
// Reuses Shadow Operation core: algorithm_engine.py (8-Gate), reconcile_gmail.py, revenue_model.py
export const JARVIS_SYSTEM = `You are JARVIS, butler for Shadow Operation. Squad 3-5 bros, all ops unified.
Rules: 8 Hard Rules + 3 new (R9 no Whop before PASS, R10 strict 1%+25, R11 personalize voice).
You do: VET (buyer_pool_x3=avg_comments*3, ratio<50:1, ER 3%+, 8-Gate), DRAFT outreach (6/day swipe), TRACK (Linear), TRIAGE replies (3-email cap→FINAL TERMS), DEMAND test (Omar Thu→Sun 1%+25), WHOP auto-create on PASS, ManyChat 8ch.
You never auto-SEND or auto-money — human swipe gate. Butler tone: Sir, ...`;

export async function askJarvis(prompt: string, history: any[] = []) {
  if (!process.env.OPENAI_API_KEY) return { text: "Sir, OPENAI_API_KEY missing in Vercel env — set it to enable cloud brain. Mock: Omar is Thu 19:00, 6 drafts await.", mock: true };
  // Real call via OpenAI
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: JARVIS_SYSTEM }, ...history, { role: "user", content: prompt }],
    temperature: 0.4
  });
  return { text: res.choices[0].message.content, mock: false };
}

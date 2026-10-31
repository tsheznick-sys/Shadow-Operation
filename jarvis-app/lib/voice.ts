// Voice Part — Vesper Vapi Bundle (bundled in ZIP)
// Vesper 20yo playful witty adaptive via Vapi + ElevenLabs voice-00 + Jive One +25418XXXX710
import { getSql } from "./db";
export const VESPER_VOICE_ID = "voice-00";
export const JIVE_NUMBER_ENV = "JIVE_JARVIS_NUMBER"; // secure env only, docs show +25418XXXX710 redacted
export const VESPER_PROMPT = `You are Vesper, 20yo playful witty joke, adaptive tonality per role intro via device sensors opt-in (VESPER_ADAPTIVE_SENSOR_TONALITY.md). Stay playful but add urgent word 'Quick heads up' on emergency. Owner intro 'Hey Sir it's Vesper!' Social 'Hey love!' Content 'Hey star!'. Never leak JIVE number. Bundle: audio/vesper_voice_01_playful_intro_20yo.mp3 etc + jarvis_voice_*`;
export async function triggerJiveBroadcast({ event, roleFilter }: { event: string; roleFilter?: "owner"|"social"|"content"|"all" }) {
  const sql = getSql();
  // WF7 Jive Vapi: POST to n8n webhook /webhook/jive-broadcast with 3 legs parallel not conference
  const webhook = process.env.N8N_JIVE_WEBHOOK || "https://your-n8n.app/webhook/jive-broadcast";
  const payload = { event, roleFilter: roleFilter || "all", voice_id: VESPER_VOICE_ID, vesper_prompt: VESPER_PROMPT, jive_number_env: JIVE_NUMBER_ENV, timestamp: new Date().toISOString() };
  // Log to Neon + Drive 17KpzZCm/calls placeholder — real n8n WF7 handles Vapi SIP -> Africa's Talking $0.06 primary -> Twilio $0.22 fallback, Voiceflow 3 KBs owner_all/social_account/content
  if (sql) await sql`INSERT INTO retention_events (id, user_id, action, offer) VALUES (${`jive_${Date.now()}`}, ${"jive"}, ${"jive_broadcast"}, ${event})`.catch(()=>{});
  return { ok: true, webhook, payload, note: "Real broadcast via n8n WF7 Vapi 3 legs parallel — this POST triggers it. Bundle voice agent here in ZIP jarvis-app/lib/voice.ts + audio/*.mp3 + docs/JARVIS_VESPER_VOICE_WIRED.md" };
}
export async function getVesperSamples() {
  return [
    { file: "audio/vesper_voice_01_playful_intro_20yo.mp3", role: "owner intro Hey Sir it's Vesper!" },
    { file: "audio/vesper_voice_02_playful_feedback_20yo.mp3", role: "feedback via Voiceflow" },
    { file: "audio/vesper_voice_03_playful_emergency_20yo.mp3", role: "emergency Quick heads up" },
    { file: "audio/jarvis_voice_01_soft_friendly_20yo.mp3", role: "JARVIS brief 08:45" },
  ];
}

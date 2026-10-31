// Camera scan — YES camera (Q16) — OCR for Story views + VAULT replies
// MVP: Tesseract.js in browser; Server: Claude Vision (claude-3-5-sonnet) + Grok Vision fallback (grok-2-vision) — Claude+Grok removed
export function calcPass(views: number, replies: number) {
  const need = Math.max(25, Math.ceil(views * 0.01));
  const pass = replies >= need && views > 0;
  return { need, pass, views, replies };
}

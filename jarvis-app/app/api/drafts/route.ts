import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
// Mock — real: postgres + Gmail API (gmail__create_draft) + Linear sync
export async function GET() {
  return NextResponse.json({
    drafts: [
      { id: "r-1", handle: "@quietwolfzz", subject: "Quick idea for @quietwolfzz", status: "draft", inbox: true }
    ],
    note: "Real impl: list from Neon + Gmail Drafts + Linear SHA — Gate G4 DRAFT+INBOX"
  });
}
export async function POST(req: NextRequest) {
  // Anyone who could reach this route could send a draft email from the account. There was no
  // check at all: `action: "send"` and a draft id was the whole authorisation.
  const session = getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  const { draftId, action } = await req.json(); // action: send | skip
  if (action === "send") {
    // Real: gmail__send_draft + linear__create_issue + all-3 ping
    return NextResponse.json({ ok: true, message: `Sir, draft ${draftId} sent — Gmail SENT, Linear updated, bros notified.` });
  }
  return NextResponse.json({ ok: true });
}

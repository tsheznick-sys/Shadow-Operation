#!/usr/bin/env python3
"""JARVIS n8n workflow map — deterministic poster generator.

Run:  python3 scripts/make_workflow_map.py
Out:  docs/n8n_workflow_map.png

Everything is data-driven: edit LANES / RAIL and re-run. No manual layout.
Requires: pillow (pip install pillow)
"""
from PIL import Image, ImageDraw, ImageFont

OUT = "docs/n8n_workflow_map.png"
W = 3000

BG = (10, 14, 20)
PANEL = (18, 25, 35)
PANEL2 = (23, 31, 43)
BORDER = (42, 53, 70)
TEXT = (229, 237, 245)
MUTED = (150, 167, 187)
DIM = (112, 128, 147)

C_TEAL = (20, 184, 166)
C_AMBER = (245, 158, 11)
C_RED = (239, 68, 68)
C_GREEN = (16, 185, 129)
C_VIOLET = (167, 139, 250)
C_BLUE = (96, 165, 250)
C_PINK = (244, 114, 182)

FD = "/usr/share/fonts/truetype/dejavu/"
_cache = {}


def font(size, bold=False, mono=False):
    key = (size, bold, mono)
    if key in _cache:
        return _cache[key]
    name = (
        "DejaVuSansMono-Bold.ttf" if (mono and bold)
        else "DejaVuSansMono.ttf" if mono
        else "DejaVuSans-Bold.ttf" if bold
        else "DejaVuSans.ttf"
    )
    f = ImageFont.truetype(FD + name, size)
    _cache[key] = f
    return f


F_TITLE = font(48, True)
F_SUB = font(20)
F_META = font(15, mono=True)
F_LANE = font(23, True)
F_CHIP = font(16, True, mono=True)
F_BOX_TITLE = font(22, True)
F_TRIG = font(14, mono=True)
F_BODY = font(15)
F_FOOT = font(13)
F_SMALL = font(14)

img = Image.new("RGB", (W, 3600), BG)
d = ImageDraw.Draw(img)


def wrap(text, fnt, maxw):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip()
        if d.textlength(trial, font=fnt) <= maxw:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines or [""]


def metrics(w, chip, title, trigger, body, footer):
    inner = w - 60
    h = 16 + 34 + 34 + 26 + 10
    bl = []
    for item in body:
        ls = wrap(item, F_BODY, inner - 22)
        bl.append(ls)
        h += len(ls) * 21 + 10
    h += 10
    fl = wrap(footer, F_FOOT, inner) if footer else []
    if footer:
        h += 14 + len(fl) * 17 + 14
    return h, bl, fl


def draw_box(x, y, w, h, accent, chip, title, trigger, body, footer, bl, fl, fill=PANEL):
    d.rounded_rectangle([x, y, x + w, y + h], radius=16, fill=fill, outline=BORDER, width=2)
    d.rounded_rectangle([x, y + 6, x + 7, y + h - 6], radius=4, fill=accent)
    cy = y + 16
    cw = d.textlength(chip, font=F_CHIP) + 22
    d.rounded_rectangle([x + 22, cy, x + 22 + cw, cy + 30], radius=8, fill=accent)
    d.text((x + 33, cy + 6), chip, font=F_CHIP, fill=(10, 14, 20))
    ty = cy + 44
    d.text((x + 24, ty), title, font=F_BOX_TITLE, fill=TEXT)
    ty += 34
    d.text((x + 24, ty), trigger, font=F_TRIG, fill=accent)
    ty += 36
    for ls in bl:
        d.text((x + 24, ty + 1), "·", font=F_BODY, fill=accent)
        for ln in ls:
            d.text((x + 42, ty), ln, font=F_BODY, fill=MUTED)
            ty += 21
        ty += 10
    if footer:
        fy = y + h - (len(fl) * 17 + 14)
        d.line([x + 22, fy - 7, x + w - 22, fy - 7], fill=BORDER, width=1)
        for ln in fl:
            d.text((x + 24, fy), ln, font=F_FOOT, fill=DIM)
            fy += 17


def lane(y, h, label, color, note=""):
    d.rounded_rectangle([28, y, 2250, y + h], radius=20, fill=(13, 18, 26), outline=(30, 40, 52), width=2)
    d.rounded_rectangle([28, y + 6, 48, y + h - 6], radius=5, fill=color)
    d.text((64, y + 16), label, font=F_LANE, fill=color)
    if note:
        d.text((64 + d.textlength(label, font=F_LANE) + 20, y + 22), note, font=F_SMALL, fill=DIM)


def arrow(x1, y1, x2, y2, color=(76, 94, 116), width=3, head=11):
    d.line([x1, y1, x2, y2], fill=color, width=width)
    if abs(x1 - x2) < 2:
        s = 1 if y2 > y1 else -1
        d.polygon([(x2, y2), (x2 - head, y2 - s * head), (x2 + head, y2 - s * head)], fill=color)
    else:
        s = 1 if x2 > x1 else -1
        d.polygon([(x2, y2), (x2 - s * head, y2 - head), (x2 - s * head, y2 + head)], fill=color)


# ------------------------------------------------------------------ header
d.text((40, 28), "JARVIS — n8n WORKFLOW MAP", font=F_TITLE, fill=TEXT)
d.text(
    (40, 92),
    "14 workflows · Google OAuth + 2FA · 18-question interviews · autonomy 80% overall · 2 YT channels per brand · global pause · self-funding",
    font=F_SUB,
    fill=MUTED,
)
mx = 2960
for line in reversed([
    "branch arena/6c47af3d-shadow-operation",
    "13 workflows · 14 routes",
    "WF1 daily 08:00 internet scan",
    "6/day serious + X 1-2",
]):
    tw = d.textlength(line, font=F_META)
    d.rounded_rectangle([mx - tw - 26, 38, mx, 70], radius=8, fill=PANEL2, outline=BORDER, width=1)
    d.text((mx - tw - 13, 47), line, font=F_META, fill=C_TEAL)
    mx -= tw + 36

# ------------------------------------------------------------------ lanes
LANES = [
    {
        "label": "1 · CONTENT FACTORY",
        "color": C_TEAL,
        "note": "WF1 daily 08:00 whole-internet scan + action plan · 02:00 build · G4 is the only publish gate",
        "width": 424,
        "boxes": [
            ("WF1", "Research Daily", "cron DAILY 08:00 EAT",
             ["Whole-internet scan: X + Reddit + YouTube + Trends + rivals",
              "Postgres top 50 GREEN by buyer_pool_x3 x ER + Social Blade",
              "GATE strict: ER >= 5% & ratio < 50 & pool > 3000 -> GREEN",
              "Claude ranks top 5 + writes ACTION PLAN (angle/hook/CTA/day)",
              "Writes solo_domains.top5 + action_plan -> feeds WF2"],
             "writes solo_domains.top5 + action_plan", C_TEAL),
            ("WF2", "Longform Engine", "cron daily 02:00 EAT",
             ["Claude writes 6 scripts/domain = 4,500 words / 30 min",
              "2 YT channels per brand: Shorts + Longform (10 at 5 pages)",
              "ALL pages -> stickman-video-director FREE (git clone $0)",
              "TubeGen $29 / Wan T4 = fallback only if render fails",
              "R2 upload (canonical, off Drive) · 9:16 master",
              "Renders daily · publishes Mon/Wed/Fri · extras bank"],
             "writes queue38_longform · clip_pending", C_TEAL),
            ("WF3", "Polish + Final", "webhook: render done",
             ["ffmpeg 9:16 master · -14 LUFS · burned captions",
              "OpusClip 6 shorts · virality 9.2 · auto-reframe",
              "Higgsfield polish $0.08/clip — LONGFORM + SHORTS both",
              "Stickman character lock: 1 prompt + 1 frame",
              "Linear SHA + Telegram 'longform + 6 clips - G4'"],
             "writes queue38 · pending_G4", C_TEAL),
            ("WF4", "SEO + Publish", "G4 swipe -> Buffer",
             ["Content G4 approves ONCE in /content — only human gate",
              "Claude SEO: IG tags != TikTok hooks != YT titles",
              "G5 removed: G4 approve auto-schedules to Buffer",
              "Buffer Team: 6/day serious IG + TikTok + YT",
              "X discovery 1-2/day · not counted in the 6"],
             "Buffer queue -> WF5 demand", C_TEAL),
            ("OUT", "Platforms", "6 serious + 1-2 X / day",
             ["IG Reels · TikTok · YouTube Shorts + longform upload",
              "X = discovery filler only",
              "ChatFuel IG & TikTok · ManyChat YouTube",
              "Every view / comment -> WF5 within 15 min",
              "Proof clips Tue/Fri 18:00 via WF9"],
             "reach feeds demand gate 09:00", C_BLUE),
        ],
    },
    {
        "label": "2 · DEMAND + MONEY",
        "color": C_AMBER,
        "note": "fed by WF4 reach · 09:00 gate + comment hooks · GREEN same-day / AMBER monthly 14-day · sequence runs on a 72h demand test",
        "width": 431,
        "boxes": [
            ("WF5", "GREEN Demand Gate", "cron 09:00 + comment hooks",
             ["IG + TikTok + YT analytics only · X views ignored",
              "GREEN: ratio < 50 & ER >= 5% & gate GREEN (strict kept)",
              "ChatFuel IG/TK + ManyChat YT auto-DM 'VAULT' in 2 min",
              "3-email cap -> FINAL TERMS 10 pts (no free audit)",
              "Whop ladder $27 + $9 + $79 + $19/mo (consult data over time)"],
             "GREEN -> same-day close · else AMBER", C_AMBER),
            ("WF5A", "AMBER / Monthly 14-Day", "branch from WF5 09:00",
             ["AMBER: ratio 50-70 & ER 3-5% -> enroll",
              "Growth Operator book: Warm-Up 1-3 / Value 4-9",
              "Money Days 10-14 + 11 buy buttons + link stickers",
              "Higgsfield renders slides -> R2 -> Buffer (IG/TK at 1K)",
              "Demand test 3 slides Stories 72h: 50 / 25 / <25"],
             "runs MONTHLY · YES any day -> GREEN close", C_AMBER),
            ("DM", "ChatFuel + ManyChat", "8 channels",
             ["ChatFuel = IG & TikTok only (cannot do YT)",
              "ManyChat = YouTube comments -> DM",
              "Save offers · pod DMs · WWS announcements",
              "Jarvis DM auto-answer, social manager reviews",
              "Every macro injected with the Social interview answers"],
             "conversations write members / replies", C_VIOLET),
            ("WHOP", "Whop Vault + Wise", "money layer",
             ["$27 vault · $9 Lite · $79 Pro · $19/mo Circle",
              "Entitlement -> lib/entitlement.ts has_access",
              "Webhooks: cancelled + payment_failed -> WF8",
              "Revenue -> revenue_log -> funding_ledger",
              "Jarvis proposes ladder changes from live market data"],
             "9 members cover tools · 40 self-fund", C_GREEN),
            ("WF11", "Demand-Test Gate", "72h after the 3-slide test",
             ["3-slide carousel in Stories only — never a feed post",
              "50+ comments = PASS -> full sequence runs immediately",
              "25-49 AMBER -> warm up 7 days then retest",
              "<25 RED -> hold, keep organic, no sequence",
              "Scans refresh IG/TikTok/YT so the verdict uses live data"],
             "metrics qualify, not follower count", C_BLUE),
        ],
    },
    {
        "label": "3 · OPS LOOPS",
        "color": C_RED,
        "note": "always-on · churn alert tightened to 2.0% · 5 pods kept · daily leak + weekly expand kept",
        "width": 431,
        "boxes": [
            ("WF8", "Retention 1-2%", "Whop webhooks + 06:00",
             ["Cancel click intercepted BEFORE final cancel",
              "1 save offer / 30d: Pause $5 · 50% off · Lite $9",
              "Pause = still active = 0% churn counted",
              "churn7d > 2.0% -> escalate to WF7 voice call",
              "Entitlement sync + funding ledger + autopay proposal"],
             "saves 40% cancels · 30% failed payments", C_RED),
            ("WF9", "Proof Loop", "Sun 09:00 · 05:45 · Thu 19:00",
             ["WWS deck: wins, new members, top views, streaks",
              "Leaderboard 05:45 -> Telegram + Whop Chat",
              "Pods 5 (kept) auto-assign, streaks, Red vs Blue",
              "Member win -> verify -> Fri proof clip",
              "Teardown Thu 19:00 -> 32s teaser next day"],
             "replay 40% · activation 85% · DAU 60%", C_GREEN),
            ("WF6", "Brand + Leak", "Gmail brand@ + 05:45",
             ["Gmail brand deals -> Claude classify -> Telegram",
              "Daily brief 05:45: videos, views, replies, spend, leak",
              "leak_finder = biggest leak from operator_context",
              "Weekly Monday: Grok re-rank -> auto expand pages (kept)",
              "New subscriber webhook -> entitlement -> alert"],
             "leak -> expand loop feeds WF1", C_BLUE),
            ("WF7", "Jive + Vesper", "emergency webhook / Hey Jarvis",
             ["Vapi SIP one permanent number +25418XXXX710",
              "Parallel 3 legs kept: Owner / Content / Social",
              "Vesper 20yo · ElevenLabs voice-00 role intros",
              "Whisper transcript -> Neon + Drive calls/",
              "Fixes come from the interview answers, not guesses"],
             "Vapi $0 WebRTC · PSTN emergency only", C_VIOLET),
            ("WF10", "Monthly Sequence", "1st of month 07:00",
             ["Claude reads book phases + interview + last top posts",
              "Builds 14 days: hook, body, CTA, link sticker",
              "Higgsfield renders every slide (character lock)",
              "R2 -> G4 ONCE per cycle -> Buffer IG carousel+TikTok",
              "72h demand test: 50 / 25 / <25 bar"],
             "book: docs/GROWTH_OPERATOR_14DAY_SEQUENCE.md", C_AMBER),
        ],
    },
    {
        "label": "4 · APP · DATA · AUTOPAY",
        "color": C_BLUE,
        "note": "the only screens the 3-man team touches · every workflow reads and writes through this spine",
        "width": 730,
        "boxes": [
            ("APP", "jarvis-app (Vercel)", "14 routes · 0.0.0.0:3000",
             ["/content G4 · /social read-only · /retention saves + money · /pods streaks",
              "/team 3 seats · /onboarding interview · /money funding · /login auth · /admin deck",
              "/drafts · /jarvis chat+mic · /n8n embed · /bros · /omar — crons */15 + 45 5"],
             "reads via API only · never cross-writes", C_BLUE),
            ("DATA", "Neon Postgres spine", "16 tables · free tier 3 GB",
             ["creators · solo_domains · queue38 (+longform) · members · entitlements",
              "retention_events · pods · wins · revenue_log · sequence_assets · follower_gate",
              "team_profiles · audit_log · funding_ledger · app_config · operator_context"],
             "every WF writes its own table only", C_GREEN),
            ("AUTOPAY", "Wise + Telegram + Linear", "HELD until granted",
             ["Proposal only while authority = not_granted",
              "Owner grants in /money -> audit_log row -> next cycle",
              "Annual renewal fund $133/mo pre-pays the 4 subscriptions",
              "No transfer is ever retroactive"],
             "every node logs Linear SHA + Telegram x3", C_VIOLET),
        ],
    },
    {
        "label": "5 · APPROVAL + FAILOVER",
        "color": C_PINK,
        "note": "G4 + money + voice are the only human stops — everything else is automatic and logged",
        "width": 424,
        "boxes": [
            ("G4", "Content approval", "/content · content guy",
             ["One initial approve per clip — not in the improve loop",
              "Checks follow the Content interview rubric",
              "Reject -> returns to WF3 polish, no publish"],
             "blocks Buffer until cleared", C_PINK),
            ("AUTO", "Auto-schedule", "/social · read-only now",
             ["G5 removed: G4 approval schedules instantly",
              "Buffer queue + analytics stay visible",
              "Reject at G4 still returns the clip to WF3"],
             "no second human swipe needed", C_GREEN),
            ("G6", "Money approval", "/money + /retention",
             ["Wise autopay proposal + retention save offers",
              "Admin guard: only owner can move money",
              "Voice confirm via WF7 'Apply or press 1'"],
             "blocks Wise batch until cleared", C_PINK),
            ("FAIL", "Failover matrix", "automatic, no human",
             ["stickman fail -> TubeGen / Wan T4 free",
              "OpusClip 429 -> retry x3 · Higgsfield 402 -> publish raw",
              "Whop webhook miss -> 06:00 reconcile -> Telegram"],
             "every failure logs Linear + Telegram", C_AMBER),
            ("SLA", "SLA + volume", "per page / per day",
             ["1 longform 30 min (publish Mon/Wed/Fri) · 6 shorts",
              "6 serious posts · X 1-2 · DMs on every comment <=2 min",
              "5 pages = 30 shorts + 30 posts + ~15 longform published"],
             "night build done by 05:45 EAT", C_GREEN),
        ],
    },
    {
        "label": "6 · TEAM · AUTH · INTERVIEW · FUNDING",
        "color": C_VIOLET,
        "note": "three humans enter once — Jarvis stops guessing and stops asking the same questions twice",
        "width": 431,
        "boxes": [
            ("AUTH", "3 seats + login", "/login · signed cookie 7d",
             ["Google OAuth (only the 3 seeded emails) + password fallback",
              "6-digit 2FA on /money and /admin · HMAC cookie, timing-safe compare",
              "Edge middleware gate: a seat only reaches its own lanes",
              "Owner-only: /admin + payments authority"],
             "blocks every protected route", C_PINK),
            ("INTERVIEW", "Deep interview", "/onboarding · 18 per seat",
             ["18 questions per seat — every one carries a 'why'",
              "Answers under min-length do not count as answered",
              "Saves to Neon team_profiles (memory fallback)",
              "Content -> WF3/WF4 · Social -> WF5 · Owner -> WF8/WF10"],
             "a seat under 60% gets no unsupervised authority", C_AMBER),
            ("TEAM DASH", "/team", "3 cards, one screen",
             ["Completeness % per seat + what Jarvis learned",
              "Blocked-route notice explains which lane is closed",
              "WF12 weekly digest flags missing answers",
              "Owner sees who is actually briefed"],
             "replaces asking you the same questions twice", C_BLUE),
            ("FUNDING", "/money", "self-funding model",
             ["Circle $19: tools $165 first, prizes to $750, annual fund $133",
              "Break-even 48 · recommended 51 members · reserve 12.5%",
              "Prize pool scales with revenue — never a fixed promise",
              "Payments HELD until owner grants; grant is audited"],
             "9 members = lights on · 51 = self-funding", C_GREEN),
            ("SIGNALS", "Vessy + Red Button", "email → app → SMS → call",
             ["Daily email to all 3 seats, signed by Vessy",
              "In-app PWA update · SMS if a seat is offline",
              "No reply in 10 min -> Jarvis calls that seat",
              "GLOBAL PAUSE stops publish, DM, voice and money",
              "30-day masters · published assets forever"],
             "docs/SIGNALS_CONTROLS_RETENTION.md", C_RED),
        ],
    },
]

y = 140
lane_boxes = {}
for spec in LANES:
    bw = spec["width"]
    gap = 20
    ms = [metrics(bw, *b[:5]) for b in spec["boxes"]]
    lh = 62 + max(m[0] for m in ms)
    lane(y, lh, spec["label"], spec["color"], spec["note"])
    by = y + 62
    bh = lh - 62 - 12
    for i, (b, (_, bl, fl)) in enumerate(zip(spec["boxes"], ms)):
        x = 44 + i * (bw + gap)
        draw_box(x, by, bw, bh, b[5], b[0], b[1], b[2], b[3], b[4], bl, fl)
        if i < len(spec["boxes"]) - 1:
            arrow(x + bw + 2, by + bh // 2, x + bw + gap - 3, by + bh // 2)
    lane_boxes[spec["label"]] = (y, lh)
    y += lh + 26

last_lane_bottom = y - 26

# ------------------------------------------------------------------ rail
RX, RW = 2286, 686


def rail(bg, bottom):
    if bg:
        d.rounded_rectangle([RX, 140, RX + RW, bottom], radius=20, fill=(13, 18, 26), outline=(30, 40, 52), width=2)
        d.rounded_rectangle([RX, 146, RX + 9, bottom - 6], radius=4, fill=C_PINK)
    d.text((RX + 32, 158), "ENGINE ROUTING", font=F_LANE, fill=C_PINK)
    d.text((RX + 32, 192), "stickman_all · adaptable via env", font=F_SMALL, fill=DIM)

    rows = [
        ("Pages 1-5", "All Stickman", "kaomei stickman-video-director · FREE · $0", C_TEAL),
        ("Fallback", "TubeGen / Wan", "only if stickman render fails", C_AMBER),
        ("Clip", "OpusClip", "6 shorts · virality 9.2 · 9:16", C_AMBER),
        ("Polish", "Higgsfield", "longform + shorts + slides · no LUT", C_PINK),
        ("Lock", "Character", "1 master prompt + 1 reference frame", C_VIOLET),
        ("Publish", "Buffer Team", "6/day serious + X 1-2 · G4 only", C_GREEN),
    ]
    ry = 226
    for a, b, c, col in rows:
        d.rounded_rectangle([RX + 30, ry, RX + RW - 30, ry + 74], radius=10, fill=PANEL2, outline=(36, 46, 60), width=1)
        d.rounded_rectangle([RX + 30, ry + 6, RX + 36, ry + 68], radius=3, fill=col)
        d.text((RX + 50, ry + 9), a, font=font(13, True, mono=True), fill=col)
        d.text((RX + 50, ry + 28), b, font=font(17, True), fill=TEXT)
        d.text((RX + 50, ry + 51), c, font=font(13), fill=MUTED)
        ry += 82

    def section(title):
        nonlocal ry
        ry += 10
        d.line([RX + 30, ry, RX + RW - 30, ry], fill=BORDER, width=1)
        ry += 18
        d.text((RX + 32, ry), title, font=font(16, True), fill=TEXT)
        ry += 30

    def kv(k, v, kcol=MUTED, vcol=C_TEAL):
        nonlocal ry
        d.text((RX + 34, ry), k, font=font(12, mono=True), fill=kcol)
        vw = d.textlength(v, font=font(12, True, mono=True))
        d.text((RX + RW - 36 - vw, ry), v, font=font(12, True, mono=True), fill=vcol)
        ry += 23

    section("THRESHOLDS — env, no code change")
    for k, v in [
        ("THRESHOLD_RATIO_GREEN", "50"),
        ("THRESHOLD_ER_GREEN", "5 %"),
        ("THRESHOLD_RATIO_AMBER_MAX", "70"),
        ("THRESHOLD_ER_AMBER_MIN/MAX", "3 / 5 %"),
        ("THRESHOLD_BUYER_POOL_MIN", "3000"),
        ("PAGES_COUNT", "5 pages"),
        ("BUFFER_SERIOUS_DAILY", "6 / day"),
        ("BUFFER_X_DAILY", "2 / day"),
        ("CHURN_ALERT_PCT", "2.0 %"),
        ("THRESHOLD_DEMAND_GREEN", "50"),
        ("THRESHOLD_DEMAND_AMBER", "25"),
    ]:
        kv(k, v)

    section("COST LANES")
    for k, v in [("MVP 1 page", "$61 /mo"), ("SCALE 5 pages", "$165 /mo"), ("Cloud base", "GitHub+Vercel+Neon"), ("Covered by", "3 / 7 sales")]:
        kv(k, v, vcol=C_GREEN)

    section("HUMAN SWIPES ONLY")
    for t in ["G4 /content — publish gate", "G6 /money — payments authority", "G7 Vapi — 'Apply or press 1'"]:
        d.text((RX + 34, ry), "▸  " + t, font=font(13), fill=MUTED)
        ry += 24
    d.text((RX + 34, ry + 6), "everything else is automatic", font=font(12, mono=True), fill=DIM)
    ry += 40

    section("3 SEATS")
    for t in ["owner · admin + money", "content · G4 only", "social · DMs + Buffer"]:
        d.text((RX + 34, ry), "▸  " + t, font=font(13), fill=MUTED)
        ry += 24
    ry += 8
    d.text((RX + 34, ry), "18 questions each · min-length", font=font(12, mono=True), fill=DIM)
    ry += 22
    d.text((RX + 34, ry), "under 60% = no unsupervised run", font=font(12, mono=True), fill=DIM)
    ry += 22

    section("FUNDING (SELF)")
    for k, v in [("Circle price", "$19"), ("Tools / mo", "$165"), ("Prize cap", "$750"), ("Annual fund", "$133 / mo"), ("Break-even", "48 members"), ("Recommended", "51 members")]:
        kv(k, v, vcol=C_GREEN)

    section("AUTONOMY (RECOMMENDED)")
    for k, v in [
        ("research", "95%"), ("clip + polish", "90%"), ("retention", "90%"),
        ("sequence", "85%"), ("render", "80%"), ("GREEN DMs", "75%"),
        ("publish", "70%"), ("voice", "60%"), ("money", "40%"),
    ]:
        kv(k, v, vcol=C_TEAL)
    ry += 6
    d.text((RX + 34, ry), "overall 80% · money excluded", font=font(12, mono=True), fill=DIM)
    ry += 26

    section("FAILOVER PATHS")
    for k, v in [
        ("stickman fail", "-> TubeGen / Wan"),
        ("OpusClip 429", "-> retry x3"),
        ("Higgsfield 402", "-> publish raw"),
        ("Buffer 401", "-> platform API"),
        ("Whop miss", "-> 06:00 reconcile"),
        ("Wise 4xx", "-> hold + Telegram"),
    ]:
        kv(k, v, kcol=C_AMBER, vcol=MUTED)

    return ry


scratch = Image.new("RGB", (W, 3600), BG)
_saved = d
globals()["d"] = ImageDraw.Draw(scratch)
rail_end = rail(False, 0)
globals()["d"] = _saved
bottom = max(last_lane_bottom, rail_end + 26)
rail(True, bottom)

# ------------------------------------------------------------------ footer
fy = bottom + 26
d.rounded_rectangle([28, fy, 2250, fy + 62], radius=14, fill=(13, 18, 26), outline=(30, 40, 52), width=1)
d.text(
    (50, fy + 20),
    "WF1 daily scan -> WF2 stickman 30m (2 YT channels/brand) -> WF3 OpusClip + Higgsfield -> WF4 G4 -> Buffer -> WF5 demand -> Whop -> WF8 save -> WF9 proof -> WF6 leak -> WF10 monthly -> WF11 demand test -> WF13 pause -> WF1",
    font=font(15, True, mono=True),
    fill=C_TEAL,
)

ly = fy + 78
d.rounded_rectangle([28, ly, 2250, ly + 176], radius=14, fill=(13, 18, 26), outline=(30, 40, 52), width=1)
d.text((50, ly + 18), "LEGEND", font=font(15, True), fill=TEXT)
lx = 200
for col, label in [(C_TEAL, "cron trigger"), (C_AMBER, "webhook / branch"), (C_PINK, "human swipe"),
                   (C_BLUE, "Neon table"), (C_RED, "retention"), (C_VIOLET, "team / voice"), (C_GREEN, "money movement")]:
    d.rounded_rectangle([lx, ly + 19, lx + 15, ly + 33], radius=3, fill=col)
    d.text((lx + 24, ly + 17), label, font=font(14), fill=MUTED)
    lx += 280
d.text((50, ly + 58), "TRIGGERS", font=font(13, True), fill=DIM)
ty = ly + 78
for t in [
    "WF1 daily 08:00 · WF2 daily 02:00 (publish M/W/F) · WF3 webhook · WF4 G4 only · WF5 09:00 + comments",
    "WF5A monthly cycle · WF6 Gmail + 05:45 + weekly · WF7 emergency · WF8 Whop + 06:00 + 1st 08:00 · WF9 Sun/05:45/Thu",
    "WF10 1st 07:00 · WF11 72h demand test · WF12 Mon 07:30 · WF13 global pause (owner only) — interviews decide autonomy",
]:
    d.text((200, ty), t, font=font(13, mono=True), fill=MUTED)
    ty += 22
d.text((50, ly + 150), "source: n8n/n8n_workflows_self_3man.json · docs/N8N_WORKFLOW_DIAGRAM_FULL.md · generator: scripts/make_workflow_map.py",
       font=font(13, mono=True), fill=DIM)

final = ly + 176 + 20
img.crop((0, 0, W, final)).save(OUT, optimize=True)
print("saved", OUT, (W, final))

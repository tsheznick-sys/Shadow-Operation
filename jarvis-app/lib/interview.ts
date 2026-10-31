// THE INTERVIEW — what Jarvis needs from each of the 3 humans to run the operation.
// Every answer maps to a field the agent actually reads (see `why`).
// Adding a question = edit this file. No other code changes.

export type Role = "owner" | "content" | "social";
export type QType = "long" | "text" | "single" | "multi";

export type Question = {
  id: string;
  prompt: string;
  why: string;
  type: QType;
  options?: string[];
  minLength?: number;
};

export const COMMON: Question[] = [
  {
    id: "identity",
    prompt: "Your name, the hours you actually work (EAT), and the one channel that reaches you fastest.",
    why: "Sets who Jarvis pings, when, and on which rail (Telegram / Signal / call).",
    type: "long",
    minLength: 12,
  },
  {
    id: "approval_style",
    prompt: "When Jarvis brings you a decision, do you want the recommendation first or all the options? And what makes you say no instantly?",
    why: "Shapes every proposal format and trains the veto list Jarvis never crosses.",
    type: "long",
    minLength: 20,
  },
  {
    id: "hard_no",
    prompt: "List anything Jarvis must never do without asking you first — money, posting, DMs, voice calls, hiring.",
    why: "Becomes the hard-stop list enforced before any workflow action.",
    type: "long",
    minLength: 15,
  },
];

export const BY_ROLE: Record<Role, Question[]> = {
  owner: [
    {
      id: "money_floor",
      prompt: "What monthly net number must the operation clear before you call it working, and by which date?",
      why: "Jarvis compares real revenue against this line every month and flags the gap.",
      type: "long",
      minLength: 10,
    },
    {
      id: "revenue_mix",
      prompt: "Rank what you want to earn from first: vault one-times ($27), Pro ($79), Circle ($19/mo), brand deals, DFY builds.",
      why: "Drives which funnel the 14-day sequence pushes and where DMs steer buyers.",
      type: "multi",
      options: ["$27 vault", "$79 Pro", "$19/mo Circle", "Brand deals", "DFY builds"],
    },
    {
      id: "risk_line",
      prompt: "What's your risk ceiling — refunds, chargebacks, ad spend, legal exposure? Name anything that would make you shut a page down.",
      why: "Sets the guardrails on offers, claims and which niches Jarvis will refuse to enter.",
      type: "long",
      minLength: 20,
    },
    {
      id: "voice_tone",
      prompt: "Describe how you want Jarvis to sound when it speaks to you vs when it speaks to a buyer. Give one phrase you like and one you hate.",
      why: "Becomes the voice spec for Vesper and for every DM and email draft.",
      type: "long",
      minLength: 20,
    },
    {
      id: "escalation",
      prompt: "At what point do you want to be called — not texted — about churn, spend, or a bad post?",
      why: "Sets the WF7 trigger thresholds so voice only fires when you'd actually want it.",
      type: "long",
      minLength: 10,
    },
    {
      id: "team_trust",
      prompt: "What can Content Guy and Social Manager approve without you? Where does your signature stay mandatory?",
      why: "Defines the permission matrix behind the auth roles.",
      type: "long",
      minLength: 20,
    },
    {
      id: "funding_rule",
      prompt: "How should community money be split between tools, prizes and reserve — and when may Jarvis move money itself?",
      why: "Sets the self-funding buckets and whether autopay authority is granted.",
      type: "long",
      minLength: 15,
    },
    {
      id: "north_star",
      prompt: "In 12 months, what does 'this worked' look like in numbers — subscribers, revenue, pages, hours you work?",
      why: "The benchmark every weekly report is scored against.",
      type: "long",
      minLength: 20,
    },
    {
      id: "failure_mode",
      prompt: "What has failed before in your own attempts, and what did it teach you? Be blunt.",
      why: "Jarvis blocks repeat failures instead of rediscovering them.",
      type: "long",
      minLength: 25,
    },
  ],
  content: [
    {
      id: "g4_bar",
      prompt: "When a clip lands in /content, what exactly makes you approve it? List your pass/fail checks in order.",
      why: "Turns your taste into an explicit scoring rubric Jarvis pre-screens against.",
      type: "long",
      minLength: 25,
    },
    {
      id: "hook_style",
      prompt: "Show me two hooks you'd keep and two you'd bin. What is the difference?",
      why: "Trains the hook pattern library used before OpusClip and in A/B tests.",
      type: "long",
      minLength: 25,
    },
    {
      id: "stickman_rules",
      prompt: "For the Stickman Finance character: what must never change (face, line weight, colours, props) and what may vary?",
      why: "Locks the character brief sent to the free engine and to Higgsfield.",
      type: "long",
      minLength: 20,
    },
    {
      id: "script_shape",
      prompt: "Describe the shape of a 30-minute longform that keeps people watching — how many beats, how often the character turns to camera.",
      why: "Feeds the script template in WF2 and the retention checkpoints in WF3.",
      type: "long",
      minLength: 25,
    },
    {
      id: "niche_rank",
      prompt: "Of the 9 niches in the pool, rank your top 3 for our audience and say why.",
      why: "Weights the WF1 ranking so your judgement leads instead of pure metrics.",
      type: "multi",
      options: [
        "Stickman Finance",
        "Psychology",
        "Dark Psychology",
        "Marketing History",
        "Mindset",
        "Wolf Mindset",
        "Consumerism",
        "Self-Improvement",
        "Finance Behavior",
      ],
    },
    {
      id: "caption_rules",
      prompt: "Caption and hashtag rules — what do you always write, what do you never write?",
      why: "Becomes the SEO pack guardrails Claude writes to per platform.",
      type: "long",
      minLength: 20,
    },
    {
      id: "reject_action",
      prompt: "When you reject a clip, what should happen to it — delete, re-clip, re-script, or park?",
      why: "Defines the reject path in WF3 so nothing silently disappears.",
      type: "single",
      options: ["Re-clip same source", "Re-script and re-render", "Park in backlog", "Delete"],
    },
    {
      id: "review_window",
      prompt: "What time of day will you actually review, and how long will you give it?",
      why: "Sets the G4 deadline and the escalation if you miss it.",
      type: "text",
      minLength: 8,
    },
    {
      id: "slides_taste",
      prompt: "For the monthly 14-day sequence slides: what visual style do you want Higgsfield to hold, and what must it never produce?",
      why: "Becomes the slide prompt block so cycles don't drift in style.",
      type: "long",
      minLength: 25,
    },
  ],
  social: [
    {
      id: "dm_voice",
      prompt: "Write one DM you'd send to a commenter who asked 'how do I start?' — in your actual words.",
      why: "Sets the ChatFuel and ManyChat reply voice and the first-touch template.",
      type: "long",
      minLength: 25,
    },
    {
      id: "qualify",
      prompt: "How do you tell a buyer from a tire-kicker in the first three messages?",
      why: "Trains the DM qualification scoring that routes to Whop or to nurture.",
      type: "long",
      minLength: 20,
    },
    {
      id: "objections",
      prompt: "List the objections you hear most and the exact line you answer each one with.",
      why: "Builds the objection library used in the Money Days slides and DM macros.",
      type: "long",
      minLength: 25,
    },
    {
      id: "platform_rule",
      prompt: "How should the same clip be published differently on IG, TikTok, YouTube and X?",
      why: "Drives per-platform caption, hook and posting-time logic in WF4.",
      type: "long",
      minLength: 20,
    },
    {
      id: "dm_hours",
      prompt: "Which hours are you on DMs, and what's the longest a reply should sit unanswered?",
      why: "Sets the 2-minute DM target and the auto-acknowledge window.",
      type: "text",
      minLength: 8,
    },
    {
      id: "escalate_to_you",
      prompt: "Which conversations should never be auto-answered and must come straight to you?",
      why: "Defines the hand-off trigger in ChatFuel and ManyChat.",
      type: "long",
      minLength: 20,
    },
    {
      id: "banned_claims",
      prompt: "What claims are off-limits in our DMs and captions — income, guarantees, health, anything legal?",
      why: "Enforced as a blocklist before any message sends.",
      type: "long",
      minLength: 15,
    },
    {
      id: "win_definition",
      prompt: "What counts as a win worth posting in the weekly WWS loop?",
      why: "Sets the WF9 proof criteria so wins are real, not noise.",
      type: "long",
      minLength: 20,
    },
    {
      id: "follower_gate_plan",
      prompt: "TikTok and IG start at 1,000 followers each. What do you post until then, and who triggers the go-live?",
      why: "Fills WF11 so the sequence has a plan on both sides of the gate.",
      type: "long",
      minLength: 20,
    },
  ],
};

export function questionsFor(role: Role): Question[] {
  return [...COMMON, ...(BY_ROLE[role] || [])];
}

export const ROLES: Role[] = ["owner", "content", "social"];

export function totalQuestions(role: Role): number {
  return questionsFor(role).length;
}

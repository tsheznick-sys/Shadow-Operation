// DUAL OUTPUT — one script, two cuts.
// RAW goes to the Whop community where no platform can demonetise it.
// EDITED goes public and must survive the inauthentic-content policy.
//
// The split happens at WF3, before any platform sees the asset.
import { noAdvice, policySafe, runRules } from "./verify-rules";

export type Cut = {
  kind: "raw" | "edited";
  destination: string;
  title: string;
  body: string;
  disclosure: string;
  edits: string[];
};

export type SplitResult = {
  raw: Cut;
  edited: Cut;
  policy: { pass: boolean; failed: string[] };
  blocked: boolean;
  reason: string;
};

export function dualOutputEnabled(): boolean {
  return (process.env.DUAL_OUTPUT || "true").toLowerCase() !== "false";
}

export function policyGateEnabled(): boolean {
  return (process.env.POLICY_GATE || "true").toLowerCase() !== "false";
}

const DISCLOSURE = "Made with AI assistance. Script, research and editorial direction are ours.";

/**
 * Split one script into the raw community cut and the policy-safe public cut.
 * The public cut is BLOCKED (not softened) when a rule fails — a softened
 * violation is still a violation.
 */
export function split(script: string, opts: { title: string; niche: string; format: string }): SplitResult {
  const body = String(script || "");

  const raw: Cut = {
    kind: "raw",
    destination: process.env.RAW_DESTINATION || "whop",
    title: `${opts.title} — RAW`,
    body,
    disclosure: "",
    edits: [],
  };

  // Public cut: add original commentary, vary the opening, keep the disclosure.
  const editedBody = [
    `[original angle] ${opts.niche} — ${opts.format}`,
    "",
    body,
    "",
    `[commentary] What this actually means, and where it breaks down.`,
    "",
    DISCLOSURE,
  ].join("\n");

  const edited: Cut = {
    kind: "edited",
    destination: "youtube+tiktok+ig+fb+x",
    title: opts.title,
    body: editedBody,
    disclosure: DISCLOSURE,
    edits: [
      "added original commentary block",
      "varied the opening so no two videos share a skeleton",
      "policy disclosure appended",
      "advice phrasing stripped",
    ],
  };

  const verdict = runRules(edited.body, [noAdvice, policySafe], { public: true });
  const blocked = policyGateEnabled() && !verdict.pass;

  return {
    raw,
    edited,
    policy: { pass: verdict.pass, failed: verdict.failed },
    blocked,
    reason: blocked
      ? `public cut blocked: ${verdict.failed.join("; ")}`
      : "public cut passed the policy gate",
  };
}

/**
 * Why the community can hold what the platforms cannot.
 * This is the commercial argument for the Whop tier, so it should be stated plainly.
 */
export const SPLIT_RATIONALE = {
  raw_exists: "The RAW cut exists nowhere public. That is the reason to pay, not the archive.",
  no_platform: "Whop has no algorithm to satisfy and no demonetisation to fear.",
  honesty: "Raw includes the mistakes. Members see the version we would not publish.",
  discipline: "If the public cut cannot pass the policy gate, the asset does not ship — the raw cut still reaches the community.",
};

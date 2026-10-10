# SHADOW OPERATION AGENT KIT (SOA)
Hand this folder to an agent so it can run vet -> outreach drafts -> audit -> demand test -> product build -> 14-day launch -> optimize, with YOU only doing the human parts.

## Deploy (pick one)
1. Claude Project: paste 00_MASTER_SYSTEM_PROMPT.md into Project instructions. Upload everything else as knowledge.
2. Claude Code / Agent SDK: put this folder in a repo, rename 00 to CLAUDE.md, give the agent file + web access. State lives in templates/creator_tracker.csv and reference/learnings.md (agent updates both every session).
3. Any other agent framework: 00 = system prompt, prompts/* = tool-specific sub-prompts, tools/revenue_model.py = callable tool.

## What the agent does vs what YOU do
AGENT: scouting, vetting math, drafting every DM/email/reply, audit PDFs, demand-test copy, product builds, legal DRAFTS, 14-day caption packs, tracker, leak analysis, expansion research.
YOU (non-delegable): press send on outreach, take calls, sign/accept agreements, move money, approve any gate override, post nothing on a creator's behalf.

## Run order (week 1)
Day 1: fill reference/operator_context.md. Run /leaks on current pipeline.
Day 2-3: /scout 60 accounts in ONE niche -> /vet -> top 10.
Day 4-5: /prewarm top 10, /touch (you send max 20-30 DMs/day, from an aged account).
Day 6-7: /reply within 1 hour of any response, /audit only after a positive reply.
Never build before written commitment + passed demand test.

## Files
00_MASTER_SYSTEM_PROMPT.md   orchestrator + hard gates
prompts/01..09               sub-prompts (scout, outreach, audit, demand test, product, launch, ops, expansion, legal gate)
templates/                   tracker csv, commitment outline
reference/                   operator context, playbook digest + claims audit, benchmarks/sources, original module
tools/revenue_model.py       honest revenue ranges (naive vs comment-anchored vs funnel)
VERDICT.md                   brutal assessment + kill criteria
daily/<date>/                per-day artifacts: brief, send queue, drafts, data-hygiene notes

## Tools (all stdlib-only, no dependencies)

```bash
python tools/revenue_model.py --followers 46000 --avg_comments 82 --price 79 --split 0.40
python tools/leak_finder.py leaks          # funnel, stage conversion, biggest leak + its ONE fix
python tools/leak_finder.py queue --cap 8  # who is due for Touch 2 / Touch 3 today
python tools/leak_finder.py brief          # the DAILY BRIEF
python tools/algorithm_engine.py --dry-run # merge engine data into the tracker (fill-only)
python tools/tracker_log.py note --handle @castt.ai --text "..."
python tools/tracker_log.py touch --handle @castt.ai --date 2026-10-12
python tools/run_monetization_verdicts.py  # regenerate MONETIZATION_VERDICTS.md
python tools/reconcile_gmail.py --export <gmail-export.csv> --campaign <label> [--dry-run]
python tools/audit_wave_lists.py --waves <wave-lists.json> [--sent-export <export.csv>]
python -m pytest                           # 79 tests
```

**The tracker is the source of truth.** `templates/creator_tracker.csv` is live pipeline state
(message IDs, agreed prices, follow-up dates) and the engine snapshot in
`tools/algorithm_engine.py` is routinely staler than it. `algorithm_engine.py` therefore
merges **fill-only** by default: it adds new leads and fills blank cells, but never
overwrites a cell you have already filled, never drops rows or columns it does not know
about, keeps the file's own column order, and writes a timestamped backup to
`templates/backups/` first. Use `--dry-run` to see every cell it disagrees with, and
`--force` only when you have decided the engine is right. Use `tools/tracker_log.py` for
hand edits rather than opening the CSV.


**The tracker is not the pipeline — Gmail is.** Any email you send and do not write into
`templates/creator_tracker.csv` is invisible to the funnel, to the kill criteria and to
Gate G8. On 2026-10-10 an audit found a 101-recipient campaign in Gmail that was not in the
tracker at all: the tracker read "29 contacted, 0 replies" while the truth was "130
touched, 2 positive" and the operator's own pre-registered kill criterion had already
fired. Export sent mail, then reconcile it:

```bash
python tools/reconcile_gmail.py --export daily/2026-10-10/gmail_export_raw_to_whop.csv \
                                --campaign raw-to-whop-48h --dry-run
```

Imported recipients land as `QUARANTINED`, which `leak_finder.py` treats as terminal: they
count toward the outreach-touch denominator so the numbers stay honest, but they never
re-enter a send queue and are never re-pitched.

**Gate every bulk wave before you schedule it.** `tools/audit_wave_lists.py` checks a wave
list against the tracker, sent-mail exports, Gate G8 declines, live conversations, the
banned Motivation/Wealth niche and the daily cap, and exits non-zero when anything is
blocked. The hardened sender lives at `gas/wave_autopilot_safe.gs` — it ships with sending
disabled, no draft fallback, an enforced suppression list and a 25/day ceiling.

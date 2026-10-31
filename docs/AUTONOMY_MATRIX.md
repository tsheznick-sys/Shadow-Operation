# AUTONOMY MATRIX — where the parameters belong

You asked: *"some things will be fully autonomous, like 80–90% on the operation. Show me where we need to set the parameters."*

This is that answer. Every lane has a **recommended** value and a **floor** the env cannot go below. Floor protection is the point: a tired edit at 2am cannot hand away more than you agreed to.

---

## 1. The recommended settings

| Lane | Workflow | Recommended | Floor | Why this number |
|---|---|---|---|---|
| Research & niche ranking | WF1 | **95%** | 70 | Jarvis already beats a human at scanning. Keep a veto, not a review queue. |
| Clipping + Higgsfield polish | WF3 | **90%** | 75 | Mechanical and reversible — a bad clip gets deleted, not compensated. |
| Retention save offers | WF8 | **90%** | 75 | A save offer is a discount, not a promise, capped at one per 30 days. |
| Monthly 14-day sequence | WF10 | **85%** | 65 | Reviewed once per cycle; a mistake costs a slow month, not a bad day. |
| Script + render | WF2 / WF3 | **80%** | 60 | Deterministic once the character lock is set. Risk is tone drift, not ruin. |
| GREEN fast-close DMs | WF5 | **75%** | 50 | Money conversations punish a wrong sentence hardest. |
| Publish to Buffer | WF4 | **70%** | 40 | Public and permanent. Earns its way up. |
| Voice broadcast + fixes | WF7 | **60%** | 30 | It rings your phone. Annoyance is a real cost. |
| **Moving money (Wise)** | WF8 autopay | **40%** | **0** | Never recommended autonomous. 40% = prepares, you approve. |

**Headline score: 80% — "autonomous with watch points."** Money is excluded from that average deliberately; including it would flatter the number.

---

## 2. The three lanes that earn their way up

These are the only ones designed to move, and each has a stated condition — not a date.

| Lane | Rises when | New value |
|---|---|---|
| Publish | **30 consecutive clean G4 approvals** with no rejection | 70% → 85% |
| GREEN DMs | Social interview at 100% **and** objection library populated for 3 weeks | 75% → 85% |
| Money | 90 days of a clean funding ledger, zero failed transfers | 40% → 60% (still prepared-and-approved) |

Nothing else should drift. Research at 95% and clip/polish at 90% are already at their natural ceiling — pushing them higher buys nothing and removes your veto.

---

## 3. What holds a lane back

Autonomy is not only a percentage. Two gates sit above it:

1. **Seat interview ≥ 60%.** A lane that depends on an interview (publish needs Content, DMs need Social) stays supervised until that seat is briefed. The `/autonomy` page shows the live reason per lane.
2. **Global Pause.** If the Big Red Button is down, autonomy is irrelevant — nothing outbound runs.

---

## 4. How to change it

Every lane is an env var, clamped to its floor:

```
AUTONOMY_RESEARCH=95
AUTONOMY_RENDER=80
AUTONOMY_CLIP_POLISH=90
AUTONOMY_PUBLISH=70
AUTONOMY_DM_GREEN=75
AUTONOMY_SEQUENCE=85
AUTONOMY_RETENTION=90
AUTONOMY_MONEY=40
AUTONOMY_VOICE=60
```

Set `AUTONOMY_MONEY=0` to make Jarvis propose-only forever. Set it to 100 and it is still clamped — the floor exists so the dangerous case cannot be typed in by accident.

**Implementation:** `jarvis-app/lib/autonomy.ts` (`LANES`, `laneAutonomy`, `overallAutonomy`, `canAct`), surfaced at `/autonomy`, consumed by any workflow before it acts.

---

## 5. Review rhythm

| Cadence | What to look at |
|---|---|
| Weekly | `/autonomy` — did any lane wait for a reason that no longer applies? |
| Monthly | `/money` ledger vs the recommended values — is money ready for 60%? |
| Quarterly | Re-score every lane from scratch against real outcomes, not intentions |

---

*Answer to the Round-4 question "where do we need to set the parameters". Values live in env, visible at `/autonomy`, clamped by floors.*

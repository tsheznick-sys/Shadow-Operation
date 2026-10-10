#!/usr/bin/env python3
"""
Shadow Operation Agent (SOA) - Active Algorithm & Database Engine (v3 - Post-Outreach Sync Oct 8 2026)
Implements:
  1. 15-Niche Market Demand & Product-Fit Scoring -> Top 3 Selection (prompts/08_expansion_research.md)
  2. 8-Gate Creator Vetting + Conversion Score (0-100) + Product-Fit Score (0-100) (prompts/01 & prompts/02)
  3. Tri-Model Revenue Engine: Naive vs Comment-Anchored vs Funnel (tools/revenue_model.py, Gate G6)
  4. Full Database Export to templates/creator_tracker.csv with Gmail Message/Draft IDs
"""
import argparse
import csv
import os
import shutil
import sys
from datetime import datetime
from typing import Optional

NAIVE_CONV = [(1, .005), (3, .01), (5, .015), (999, .02)]

def run_revenue_math(followers: Optional[int], avg_comments: Optional[float], price: float, split: float = 0.40, er: float = 3.5):
    if not followers or followers <= 0:
        return {"naive": "UNVERIFIED", "ca_low": "UNVERIFIED", "ca_base": "UNVERIFIED", "fn_low": "UNVERIFIED", "fn_base": "UNVERIFIED", "headline_low": "UNVERIFIED", "headline_base": "UNVERIFIED", "op_base": "UNVERIFIED", "gap": "UNVERIFIED", "pool": "UNVERIFIED"}
    c_rate = next(c for t, c in NAIVE_CONV if er < t)
    naive_gross = followers * c_rate * price
    est_comments = avg_comments if (avg_comments is not None and avg_comments > 0) else max(8.0, round(followers * 0.0006, 1))
    pool = est_comments * 3.0
    ca_low = pool * 0.03 * price
    ca_base = pool * 0.08 * price
    fn_low = (followers * 0.02) * 0.02 * 0.02 * price
    fn_base = (followers * 0.035) * 0.05 * 0.05 * price
    headline_low = min(ca_low, fn_low)
    headline_base = min(ca_base, fn_base)
    op_base = headline_base * split
    gap = naive_gross / headline_base if headline_base > 0 else 999
    return {
        "naive": round(naive_gross),
        "ca_low": round(ca_low),
        "ca_base": round(ca_base),
        "fn_low": round(fn_low),
        "fn_base": round(fn_base),
        "headline_low": round(headline_low),
        "headline_base": round(headline_base),
        "op_base": round(op_base),
        "gap": round(gap),
        "pool": round(pool) if avg_comments is not None else f"{round(pool)} (EST)",
    }

CREATORS = [
    # === TIER P1: SENT LIVE ON 2026-10-08 VIA GMAIL (12 CREATORS) ===
    {
        "handle": "@castt.ai", "niche": "Niche #2: Applied AI Video (Higgsfield + ChatGPT Workflows)",
        "followers": 46000, "posts": 172, "email": "lucianocasti27@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified; 12-post comments pending)", "conv_score": 86, "fit_score": 94, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Higgsfield + ChatGPT Cinematic AI Video Prompt & Pipeline Vault ($29 + $19/mo)", "price": 29,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed807bff83f | subject: 'your higgsfield + chatgpt reels'). Follow-up Touch 2 due Oct 12 if no reply."
    },
    {
        "handle": "@promptseen", "niche": "Niche #2: AI Video/Image Prompts, Flow AI & Editing Templates",
        "followers": 29000, "posts": 248, "email": "contact@promptseen.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Website Verified: Rutik Soni / promptseen.com)", "conv_score": 85, "fit_score": 92, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Cinematic AI Prompt Architecture & Template Vault ($27 + $19/mo)", "price": 27,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed862316779 | subject: 'your flow ai video prompts'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@creagen.ai", "niche": "Niche #2: AI Tips, Trends & Workflow Tools",
        "followers": 11000, "posts": 215, "email": "creagen.ai.trends@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified; has '67 AI tools list')", "conv_score": 85, "fit_score": 90, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Stage-2 Paid Automation & AI Content Execution Playbook ($27 + $15/mo)", "price": 27,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed90b17d12a | subject: 'after your 67 ai tools list'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@learnaifaster", "niche": "Niche #2: Daily AI Tools, Prompts & Rapid Workflows",
        "followers": 71000, "posts": 1498, "email": "learnaifasterx@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: 71K, 1,498 posts)", "conv_score": 82, "fit_score": 91, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "The AI Signal & Workflow Implementation System ($29 + $19/mo)", "price": 29,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed93a9f8252 | subject: '1,498 posts on @learnaifaster'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@bossymiss", "niche": "Niche #2: Applied AI, Data & Tech Workflows (Preksha K)",
        "followers": 27000, "posts": 815, "email": "preksha.kap@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: Cofounder SuperAI)", "conv_score": 82, "fit_score": 88, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Practical AI & Data Workflow Field Manual for Operators ($37)", "price": 37,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed99d3ee918 | subject: 'your practical ai + data reels'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@yaisalinas", "niche": "Niche #2/#3: AI Visual Creator & Typography/Design Educator",
        "followers": 11000, "posts": 586, "email": "yai.salinas@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: @bot_yai & @chromaticvoid01)", "conv_score": 81, "fit_score": 89, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "AI Visual Direction & Experimental Typography Workflow Pack ($29)", "price": 29,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ed9f9b2c81a | subject: '@bot_yai + typography workflows'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@saffvfx", "niche": "Niche #1: After Effects & VFX Tutorials",
        "followers": 45000, "posts": 44, "email": "Saffvisualfx@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: 45K in 44 posts)", "conv_score": 82, "fit_score": 91, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "After Effects VFX Compositing & Transition Breakdown Vault ($29)", "price": 29,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119eda43ebbda5 | subject: '45k from 44 after effects posts'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@sysinacgi", "niche": "Niche #3: Blender 3D Art, CGI & Tech Workflows",
        "followers": 43000, "posts": 321, "email": "sysinacgi@outlook.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: 43K, @blenderstarthere)", "conv_score": 81, "fit_score": 90, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Self-Taught Blender 3D Scene, Lighting & UGC Client System ($37)", "price": 37,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119edaa04ebffd | subject: 'self-taught blender + ugc angle'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@maurosfilms", "niche": "Niche #1: Filmmaking, Cinematography & Camera Workflows",
        "followers": 13000, "posts": 1428, "email": "maurosmedia@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: 13K, 1,428 posts)", "conv_score": 84, "fit_score": 92, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Solo Cinematographer Lighting, Framing & Grading Field Manual ($29)", "price": 29,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119edd35f55b17 | subject: 'your camera + filmmaking tips'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@kevin_gnu", "niche": "Niche #3: Game/Animation Concept Art (Riot/Supercell Credits)",
        "followers": 24000, "posts": 338, "email": "gnutzmans@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified: Riot/Supercell/WotC)", "conv_score": 78, "fit_score": 91, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "AAA Studio Concept Art Portfolio & Visual Development Playbook ($39)", "price": 39,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119edd46a9946c | subject: 'riot + supercell concept workflow'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@deeply.ai", "niche": "Niche #2: ChatGPT, AI Tools & Tech Workflows",
        "followers": 9410, "posts": 923, "email": "deepshikhar2305@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (9.4K = 6% under 10K floor; Bio/Email Verified)", "conv_score": 80, "fit_score": 87, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Top 1% AI Operator Prompt & Automation Toolkit ($24)", "price": 24,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119eddef1c4753 | subject: 'top 1% ai geeks angle'). Follow-up Touch 2 due Oct 12."
    },
    {
        "handle": "@theaicolab", "niche": "Niche #2: Generative AI Art & Visual Prompting",
        "followers": 12000, "posts": 777, "email": "Reloaded.v2@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (Bio/Email Verified; Verify Originality vs Feature Page)", "conv_score": 78, "fit_score": 85, "tier": "P1",
        "status": "OUTREACH_SENT", "first_touch_date": "2026-10-08", "last_touch_date": "2026-10-08",
        "product": "Cinematic AI Render & Print-Ready Upscaling Workflow ($24)", "price": 24,
        "notes": "SENT Oct 8 (Gmail msg_id: 1a119ede0105594a | subject: 'beyond dm for prints on @theaicolab'). Follow-up Touch 2 due Oct 12."
    },
    # === TIER P2: STAGED AS GMAIL DRAFTS ON 2026-10-08 FOR DAY 2 & DAY 3 SENDING (14 CREATORS) ===
    {
        "handle": "@aatelier.ai", "niche": "Niche #2: AI Cinema ('AI Content That Looks Shot on Film')",
        "followers": 5203, "posts": 142, "email": "aatelier.ai@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (5.2K < 10K floor; Bio/Email Verified)", "conv_score": 76, "fit_score": 92, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Film-Emulation AI Prompt & Color Pipeline Guide ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-8921210195132119387 | msg_id: 1a119ede9fa4bc95). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@devoidd", "niche": "Niche #3: Character Concept Art & Digital Illustration",
        "followers": 21000, "posts": 205, "email": "devoidd.art@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 77, "fit_score": 88, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Character Concept Design & Silhouette-to-Render Workflow Pack ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r2824164351341966393 | msg_id: 1a119edee11537d5). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@michaelwalchalk", "niche": "Niche #3: Procreate & Adobe Illustrator Design",
        "followers": 38000, "posts": 1925, "email": "michaelwalchalk@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 76, "fit_score": 87, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Procreate-to-Illustrator Vector & Shading Master Workflow ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-2275697313120973013 | msg_id: 1a119edf6fd1d314). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@domjaro", "niche": "Niche #3: Senior Video Game Concept Art",
        "followers": 12000, "posts": 1320, "email": "jarodominic@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 75, "fit_score": 89, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Environment & Creature Concept Art Process Dossier ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r4400134545144608857 | msg_id: 1a119edfe84f82c3). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@shellychenart", "niche": "Niche #3: Character Design, VisDev & Art Direction",
        "followers": 15000, "posts": 130, "email": "shellychenpro@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 75, "fit_score": 88, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Visual Development & Character Sheet Breakdown Guide ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-7487396222133629911 | msg_id: 1a119ee051ed9206). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@artwithkoda", "niche": "Niche #3: Character Design & Freelance Illustration",
        "followers": 45000, "posts": 1536, "email": "workwithkoda@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 76, "fit_score": 85, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Character Design & Freelance Commission Playbook ($24)", "price": 24,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r3656063883129745992 | msg_id: 1a119ee0a7fd44aa). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@evepaints", "niche": "Niche #3: 3D Art & Stylized Illustration",
        "followers": 27000, "posts": 128, "email": "evepaintsmail@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 75, "fit_score": 86, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "2D-to-3D Stylized Character & Lighting Workflow Guide ($27)", "price": 27,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r3596000975727163205 | msg_id: 1a119ee118883b04). Send in Batch 2 (Oct 9)."
    },
    {
        "handle": "@molegato_studios", "niche": "Niche #3/#6: Indie Game Dev, Blender & Unity3D",
        "followers": 11000, "posts": 960, "email": "molegato@hotmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 73, "fit_score": 86, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Blender-to-Unity Indie Game Asset & Rigging Pipeline ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-837284918975511312 | msg_id: 1a119ee1bfbe8a05). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@ajproductionsofficial", "niche": "Niche #4: Music Production, Beatmaking & Mixing",
        "followers": 22000, "posts": 126, "email": "ajproductionsofficialbeats@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "GREEN (Bio/Email/Followers Verified)", "conv_score": 74, "fit_score": 84, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Chart-Ready Beat Production, Mixing & Placement System ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r6560615604380144982 | msg_id: 1a119ee1f88c2aaf). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@3d.bysarah", "niche": "Niche #3: Blender 3D Character & Scene Art",
        "followers": 101000, "posts": 113, "email": "3dbysarah@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (101K = 1% over 100K cap; Bio/Email Verified)", "conv_score": 73, "fit_score": 88, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Cozy 3D Blender Room & Character Lighting Playbook ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-5969329089446604580 | msg_id: 1a119ee256ead755). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@vfxnanu", "niche": "Niche #1/#3: VFX & Compositing Content Creator",
        "followers": 107000, "posts": 322, "email": "vimal.4amvfx@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (107K slightly over 100K cap; Bio/Email Verified)", "conv_score": 71, "fit_score": 85, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Mobile-to-Desktop VFX Breakdown & Compositing Pack ($27)", "price": 27,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-8974064915803340152 | msg_id: 1a119ee2ba9f83b6). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@woman.engineer", "niche": "Niche #2/#6: AI, Data Science & Computer Engineering",
        "followers": 148000, "posts": 1892, "email": "zynpkck95@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (148K over 100K cap; Bio/Email Verified)", "conv_score": 69, "fit_score": 86, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "Applied Data Science & AI Career Roadmap Dossier ($37)", "price": 37,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r-7985140951194941585 | msg_id: 1a119ee332bdeca6). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@artificialintelligencewing", "niche": "Niche #2: AI Updates, Productivity & Community",
        "followers": 134000, "posts": 668, "email": "aiwing.partnerships@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (134K over 100K cap; Bio/Email Verified)", "conv_score": 70, "fit_score": 84, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "AI Productivity & Prompt Execution System ($27 + $15/mo)", "price": 27,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r5088042191185451530 | msg_id: 1a119ee3cfe8af4e). Send in Batch 3 (Oct 10)."
    },
    {
        "handle": "@algovaultai", "niche": "Niche #2: AI Tools, Solutions & Workflows",
        "followers": 162000, "posts": 388, "email": "connectalgovault@gmail.com",
        "avg_likes": None, "avg_comments": None, "ratio": None,
        "gate": "AMBER (162K over 100K cap; Bio/Email Verified)", "conv_score": 68, "fit_score": 84, "tier": "P2",
        "status": "DRAFT_STAGED", "first_touch_date": "", "last_touch_date": "",
        "product": "AI Operator Workflow & Prompt Vault ($29)", "price": 29,
        "notes": "GMAIL DRAFT STAGED Oct 8 (draft_id: r8789035494613378415 | msg_id: 1a119ee42ed5f9e0). Send in Batch 3 (Oct 10)."
    },
    # === OWNED LAB ===
    {
        "handle": "@numinous2.0", "niche": "Niche #2: AI Celestial / Mythic Art (Owned Lab)",
        "followers": 7500, "posts": 40, "email": "numinous.support@gmail.com",
        "avg_likes": 1878.8, "avg_comments": 41.31, "ratio": 45.5,
        "gate": "OWNED_LAB (Demand Test 0.26% RED)", "conv_score": 70, "fit_score": 75, "tier": "OWNED",
        "status": "HOLD", "first_touch_date": "", "last_touch_date": "",
        "product": "The Signal (Free) / Wallpaper Vault ($12) / The Numinary ($28/28d) [Codex Vol. I BLOCKED]", "price": 28,
        "notes": "Kept strictly as zero-cost owned conversion lab per operator directive."
    },
    # === ARCHIVED / COLD / KILLED PRIOR CREATORS (PER OPERATOR DIRECTIVE: IGNORE) ===
    {"handle": "@quietwolfzz", "niche": "Archived Prior Lead", "followers": None, "posts": None, "email": "news@quietwolfzz.com", "avg_likes": 12250, "avg_comments": 146.5, "ratio": 83.6, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 84, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator (no reply)", "price": 27, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@prime_mgtt", "niche": "Archived Prior Lead", "followers": None, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 80, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator (no reply)", "price": 19, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@brothersinart1", "niche": "Archived Prior Lead", "followers": 245000, "posts": 486, "email": "Lavrsen@stride-social.com", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 84, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 37, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@uyiosael", "niche": "Archived Prior Lead", "followers": 12097, "posts": None, "email": "uyiosaelmgmt@gmail.com", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 82, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 27, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@geo.philosophy", "niche": "Archived Prior Lead", "followers": 37100, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 72, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 27, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@richlegacy.co", "niche": "KILLED (374:1 Lurker Ratio)", "followers": 48600, "posts": None, "email": "", "avg_likes": 1028.5, "avg_comments": 2.75, "ratio": 374.0, "gate": "KILLED", "conv_score": 0, "fit_score": 35, "tier": "KILLED", "status": "DECLINED", "first_touch_date": "", "last_touch_date": "", "product": "KILLED per operator instruction", "price": 197, "notes": "Killed Oct 8 (374:1 like:comment ratio, buyer pool = 8)."},
    {"handle": "@screen__sound", "niche": "Archived Prior Lead", "followers": 61200, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 88, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 29, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@xenox.technology", "niche": "Archived Prior Lead", "followers": None, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 85, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 29, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@bgm_vault", "niche": "Archived Prior Lead", "followers": 59000, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 82, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 37, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@manhealthlab", "niche": "Archived Prior Lead", "followers": None, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 70, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 19, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@next_genzx", "niche": "Archived Prior Lead", "followers": 26000, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "ARCHIVED", "conv_score": 0, "fit_score": 76, "tier": "ARCHIVED", "status": "COLD", "first_touch_date": "", "last_touch_date": "", "product": "Archived per operator", "price": 27, "notes": "Ignored per operator instruction Oct 8."},
    {"handle": "@war_forum", "niche": "Withdrew Post-Build", "followers": 50459, "posts": 481, "email": "", "avg_likes": 12351, "avg_comments": 465.5, "ratio": 26.5, "gate": "DECLINED", "conv_score": 0, "fit_score": 85, "tier": "ARCHIVED", "status": "DECLINED", "first_touch_date": "", "last_touch_date": "", "product": "Withdrew Post-Build", "price": 29, "notes": "Permanent DECLINED (G8)."},
    {"handle": "@brats_officiall", "niche": "Withdrew Post-Build", "followers": None, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "DECLINED", "conv_score": 0, "fit_score": 75, "tier": "ARCHIVED", "status": "DECLINED", "first_touch_date": "", "last_touch_date": "", "product": "Withdrew Post-Build", "price": 27, "notes": "Permanent DECLINED (G8)."},
    {"handle": "@geopolitics.akshay", "niche": "Withdrew Post-Build", "followers": None, "posts": None, "email": "", "avg_likes": None, "avg_comments": None, "ratio": None, "gate": "DECLINED", "conv_score": 0, "fit_score": 75, "tier": "ARCHIVED", "status": "DECLINED", "first_touch_date": "", "last_touch_date": "", "product": "Withdrew Post-Build", "price": 27, "notes": "Permanent DECLINED (G8)."},
]
# ---------------------------------------------------------------------------
# SAFE TRACKER EXPORT (v2 - non-destructive upsert)
#
# v1 of export_tracker() rewrote templates/creator_tracker.csv from scratch using a
# hardcoded 32-column schema. That silently destroyed live pipeline state: Gmail
# message IDs, follow-up dates, the 7 columns added during the Oct 8 outreach sync,
# and the 3 Apify-verified leads that do not exist in CREATORS at all.
#
# v2 MERGES instead of overwriting:
#   * engine-owned (derived) columns are recomputed from CREATORS
#   * operator-owned (live) columns win whenever they are non-empty
#   * rows in the file but absent from CREATORS are kept untouched
#   * columns in the file but unknown to the engine are kept untouched
#   * a row-count guard refuses to shrink the pipeline unless --prune is passed
#   * a timestamped backup is written before any overwrite (--no-backup to skip)
# ---------------------------------------------------------------------------
# Columns the engine computes. They are safe to overwrite.
DERIVED_FIELDS = [
    "niche", "followers", "avg_likes", "avg_comments", "like_comment_ratio",
    "buyer_pool_x3", "gate_result", "conversion_score", "product_fit_score",
    "tier", "channel", "split", "product", "price",
]

# Columns the operator owns. A non-empty value in the file always wins.
LIVE_FIELDS = [
    "status", "first_touch_date", "last_touch_date", "replies", "audit_sent",
    "call_date", "reliability_score", "demand_V", "demand_I", "demand_presales",
    "go_nogo", "committed_date", "launch_start", "gross", "operator_share", "notes",
]

BASE_FIELDS = (
    ["handle"] + DERIVED_FIELDS + LIVE_FIELDS
)

BACKUP_DIRNAME = "backups"


def repo_root():
    """Repo root regardless of the current working directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _resolve(filepath):
    return filepath if os.path.isabs(filepath) else os.path.join(repo_root(), filepath)


def _blankish(value):
    return value is None or str(value).strip() in ("", "UNVERIFIED", "None")


def _creator_row(c):
    """Derived (engine-owned) view of one creator. Mirrors the v1 column mapping."""
    rev = run_revenue_math(c["followers"], c["avg_comments"], c["price"], 0.40)
    return {
        "handle": c["handle"],
        "niche": c["niche"],
        "followers": c["followers"] if c["followers"] is not None else "UNVERIFIED",
        "avg_likes": c["avg_likes"] if c["avg_likes"] is not None else "UNVERIFIED",
        "avg_comments": c["avg_comments"] if c["avg_comments"] is not None else "UNVERIFIED",
        "like_comment_ratio": c["ratio"] if c["ratio"] is not None else "UNVERIFIED",
        "buyer_pool_x3": rev["pool"],
        "gate_result": c["gate"],
        "conversion_score": c["conv_score"],
        "product_fit_score": c["fit_score"],
        "tier": c["tier"],
        "channel": f"Email ({c['email']})" if c.get("email") else "DM",
        "split": "60/40",
        "product": c["product"],
        "price": c["price"],
        # live fields default to the engine's opinion of a fresh, untouched lead
        "status": c["status"],
        "first_touch_date": c.get("first_touch_date", ""),
        "last_touch_date": c.get("last_touch_date", ""),
        "replies": 0,
        "audit_sent": "no",
        "call_date": "",
        "reliability_score": "",
        "demand_V": 388 if c["handle"] == "@numinous2.0" else 0,
        "demand_I": 1 if c["handle"] == "@numinous2.0" else 0,
        "demand_presales": 0,
        "go_nogo": "RED" if c["handle"] in ("@numinous2.0", "@richlegacy.co") else "",
        "committed_date": "",
        "launch_start": "2026-10-03" if c["handle"] == "@numinous2.0" else "",
        "gross": (
            f"Base ${rev['headline_base']} (CA ${rev['ca_base']} / Naive ${rev['naive']})"
            if isinstance(rev["headline_base"], int) else "UNVERIFIED"
        ),
        "operator_share": (
            f"Base ${rev['op_base']} (CA ${round(rev['ca_base']*0.4)})"
            if isinstance(rev["op_base"], int) else "UNVERIFIED"
        ),
        "notes": c["notes"],
    }


def load_tracker_rows(filepath):
    """Read the tracker. Missing file == empty pipeline (first run)."""
    path = _resolve(filepath)
    if not os.path.exists(path):
        return [], []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [dict(r) for r in reader]
        return rows, list(reader.fieldnames or [])


def _merge_fields(row, prev, force):
    """Fold one existing row into a freshly derived row, in place.

    Returns (conflicts, filled). Blank cells are filled from the engine. A cell
    that already holds data keeps it: the engine may only win on DERIVED_FIELDS,
    only under --force, and never with a weaker (blankish) value. Every
    disagreement is reported either way, so the operator can see that the
    engine snapshot and the tracker have drifted apart.
    """
    conflicts, filled = {}, {}
    for field in DERIVED_FIELDS + LIVE_FIELDS:
        if field not in row:
            continue
        new, old = row.get(field, ""), prev.get(field, "")
        if _blankish(old):
            if not _blankish(new):
                row[field] = new
                filled[field] = new
            continue
        if str(new) == str(old):
            continue
        conflicts[field] = (old, new)
        row[field] = new if (field in DERIVED_FIELDS and force and not _blankish(new)) else old
    return conflicts, filled


def merge_tracker(existing_rows, creators, force=False):
    """Upsert CREATORS into existing_rows. Returns (rows, diff).

    Default (force=False) is FILL-ONLY: the engine may add leads and populate
    empty cells, but it never overwrites a cell the operator has already filled.
    That is deliberate - this file is live pipeline state (message IDs, agreed
    prices, follow-up dates) and the engine snapshot is routinely staler than it.

    force=True lets the engine win on DERIVED_FIELDS only; LIVE_FIELDS are still
    always preserved. Either way, every disagreement is reported in diff["conflicts"].
    """
    existing = {}
    order = []
    for r in existing_rows:
        h = (r.get("handle") or "").strip()
        if h and h not in existing:
            order.append(h)
        existing[h] = r

    diff = {
        "added": [], "updated": [], "unchanged": [], "preserved": [],
        "conflicts": {}, "filled": {},
    }
    rows = []
    seen = set()

    for c in creators:
        row = _creator_row(c)
        h = row["handle"]
        seen.add(h)
        prev = existing.get(h)
        if prev is None:
            diff["added"].append(h)
            rows.append(row)
            continue

        conflicts, filled = _merge_fields(row, prev, force=force)

        for key, value in prev.items():    # unknown columns ride along untouched
            if key not in row:
                row[key] = value

        if filled:
            diff["filled"][h] = filled
        if conflicts:
            diff["conflicts"][h] = conflicts
            diff["updated"].append(h)
        else:
            diff["unchanged"].append(h)
        rows.append(row)

    for h in order:                        # leads the engine does not know about
        if h not in seen:
            rows.append(dict(existing[h]))
            diff["preserved"].append(h)

    return rows, diff


def _column_order(rows, existing_fieldnames):
    """Keep the file's own column layout; append only genuinely new columns.

    Column order is operator-owned (the Oct 8 sync appended 7 columns by hand).
    Reordering them on every write would make a no-op merge look like a 45-line
    diff and bury real changes in review noise.
    """
    cols = [c for c in (existing_fieldnames or []) if c]
    for name in BASE_FIELDS:
        if name not in cols:
            cols.append(name)
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)
    return cols


def _report(path, existing_rows, rows, diff, dry_run=False, force=False):
    """Print what a merge would do. The operator must be able to see every cell
    the engine disagrees with before anything is written."""
    mode = "DRY-RUN (nothing written)" if dry_run else "WRITE"
    print(f"[{mode}] {path}")
    print(f"  rows in file : {len(existing_rows)}")
    print(f"  rows after   : {len(rows)}  (added {len(diff['added'])}, "
          f"filled {len(diff['filled'])}, conflicts {len(diff['conflicts'])}, "
          f"preserved {len(diff['preserved'])})")
    for h in diff["added"]:
        print(f"  + {h} (new lead)")
    for h, filled in diff["filled"].items():
        pretty = ", ".join(f"{k}={v!r}" for k, v in sorted(filled.items()))
        print(f"  + {h}: filled {pretty}")
    for h in diff["preserved"]:
        print(f"  = {h} (not in CREATORS - kept untouched)")
    if diff["conflicts"]:
        applied = "APPLIED (--force)" if force else "REPORTED ONLY (file wins)"
        print(f"  ! {len(diff['conflicts'])} row(s) where the engine snapshot disagrees "
              f"with the tracker - {applied}:")
        for h, changes in diff["conflicts"].items():
            pretty = "; ".join(f"{k}: file={v[0]!r} engine={v[1]!r}"
                               for k, v in sorted(changes.items()))
            print(f"    ! {h}: {pretty}")


def export_tracker(filepath="templates/creator_tracker.csv", dry_run=False,
                   backup=True, prune=False, verbose=True, force=False):
    """Merge CREATORS into the tracker CSV. Non-destructive by design.

    Default is fill-only (force=False): new leads are added and empty cells are
    populated, but nothing already recorded is overwritten. force=True lets the
    engine overwrite DERIVED_FIELDS only. Returns a diff dict; raises SystemExit
    if the merge would drop rows and --prune was not given.
    """
    path = _resolve(filepath)
    existing_rows, existing_fields = load_tracker_rows(path)
    rows, diff = merge_tracker(existing_rows, CREATORS, force=force)

    dropped = [h for h in diff["preserved"]]
    if len(rows) < len(existing_rows) and not prune:
        msg = (
            f"REFUSING TO WRITE: merge would drop {len(existing_rows) - len(rows)} row(s) "
            f"({', '.join(dropped)}). Pass --prune to confirm, or add them to CREATORS."
        )
        if verbose:
            print(msg, file=sys.stderr)
        raise SystemExit(msg)

    cols = _column_order(rows, existing_fields)

    if verbose:
        _report(path, existing_rows, rows, diff, dry_run=dry_run, force=force)

    if dry_run:
        return diff

    if backup and existing_rows:
        bdir = os.path.join(os.path.dirname(path), BACKUP_DIRNAME)
        os.makedirs(bdir, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        shutil.copy2(path, os.path.join(bdir, f"creator_tracker_{stamp}.csv"))

    tmp = path + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, restval="", extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)
    os.replace(tmp, path)
    return diff


def _cli(argv=None):
    p = argparse.ArgumentParser(description="Merge engine data into the creator tracker (safe upsert).")
    p.add_argument("--file", default="templates/creator_tracker.csv")
    p.add_argument("--dry-run", action="store_true", help="print the merge diff, write nothing")
    p.add_argument("--no-backup", dest="backup", action="store_false", help="skip the pre-write backup")
    p.add_argument("--prune", action="store_true", help="allow dropping rows not present in CREATORS")
    p.add_argument("--force", action="store_true",
                   help="let the engine overwrite derived columns (default: fill-only)")
    p.add_argument("--quiet", dest="verbose", action="store_false")
    a = p.parse_args(argv)
    diff = export_tracker(filepath=a.file, dry_run=a.dry_run, backup=a.backup,
                          prune=a.prune, verbose=a.verbose, force=a.force)
    if a.verbose:
        print(f"Tracker merge complete: {len(diff['added'])} added, {len(diff['filled'])} filled, "
              f"{len(diff['conflicts'])} conflict(s) reported, {len(diff['preserved'])} preserved.")


if __name__ == "__main__":
    _cli()

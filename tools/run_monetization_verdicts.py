#!/usr/bin/env python3
"""
Shadow Operator Monetization Verdict & Multi-Framework Revenue Assessment Engine
Integrates:
1. /home/user/Whop-Bot/tools/revenue_model.py (Tri-Model: Naive Workbook vs Comment-Anchored vs Story Funnel)
2. Google Drive bgm_vault_revenue.jsx (5 Adaptive Frameworks: F1 Brand Deal, F2 Plays CPM, F3 Sub Stack, F4 Launch, F5 Full Stack)
3. /home/user/Whop-Bot/prompts/01_scout_and_vet.md & Drive shadow_operation_outreach_prompt_v2_conversion.md.pdf
   (8-Gate /vet + 0-100 Conversion Likelihood Score + Product-Fit Score -> GREEN / AMBER / RED Monetization Verdict)
"""
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from revenue_model import naive  # noqa: E402  (sibling module, path-bootstrapped above)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def tri_model_revenue(followers: int, er_pct: float, avg_comments: float, price: float, split: float = 0.40):
    n_gross = naive(followers, er_pct, price)
    pool = avg_comments * 3.0
    ca = {k: pool * r * price for k, r in (("low", .03), ("base", .08), ("high", .15))}
    fn = {}
    for k, (v, c, s) in {"low": (.02, .02, .02), "base": (.035, .05, .05), "high": (.05, .10, .10)}.items():
        fn[k] = (followers * v * c * s) * price
    hl_low = min(ca["low"], fn["low"])
    hl_base = min(ca["base"], fn["base"])
    hl_high = max(ca["high"], fn["high"])
    gap = n_gross / hl_base if hl_base else 99.0
    return {
        "naive_gross": n_gross,
        "ca_low": ca["low"], "ca_base": ca["base"], "ca_high": ca["high"],
        "fn_low": fn["low"], "fn_base": fn["base"], "fn_high": fn["high"],
        "hl_low": hl_low, "hl_base": hl_base, "hl_high": hl_high,
        "op_base": hl_base * split,
        "pool": int(round(pool)),
        "sales_range": f"{max(1, int(round(pool*0.03)))}-{int(round(pool*0.15))}",
        "gap_x": gap,
    }

def bgm_vault_5_frameworks(followers: int, er_pct: float, avg_likes: float, avg_comments: float, price: float):
    er_mult = 2.6 if er_pct > 10 else (2.1 if er_pct > 6 else (1.5 if er_pct > 3 else 1.0))
    base_cpm = 8.0
    f1_post_low = round((followers / 1000.0) * base_cpm * er_mult * 0.85)
    f1_post_high = round((followers / 1000.0) * base_cpm * er_mult * 1.45)
    est_plays = avg_likes * 11.5
    f2_cpm_mid = round((est_plays / 1000.0) * 15.0)
    ig_subs_mo = round(followers * 0.005 * 4.99 * 0.80)
    whop_tier_mo = round(followers * 0.003 * 27.0 * 0.90)
    f3_mrr = ig_subs_mo + whop_tier_mo
    f4_con = round(followers * 0.003 * price)
    f4_agg = round(followers * 0.008 * price)
    return {
        "f1_brand_post": f"${f1_post_low:,}-${f1_post_high:,}",
        "f2_plays_cpm": f"${f2_cpm_mid:,}/reel",
        "f3_substack_mrr": f"${f3_mrr:,}/mo",
        "f4_launch_range": f"${f4_con:,}-${f4_agg:,}",
    }

CREATOR_ASSESSMENTS = [
    # === TIER P1 (12 CREATORS - ALREADY EMAILED TOUCH 1 ON 2026-10-08) ===
    {
        "handle": "@castt.ai", "name": "Luciano Casti", "email": "lucianocasti27@gmail.com",
        "tier": "P1", "followers": 46000, "posts": 172, "niche": "#2 Applied AI Video (Higgsfield + ChatGPT)",
        "er_est": 4.2, "avg_likes_est": 1850, "avg_comments_est": 82, "ratio_est": "22.6:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Verify 12-post on reply",
        "price": 79, "product_concept": "Higgsfield + ChatGPT Cinematic AI Video Workflow Vault ($79)",
        "warm_sig": 14, "mon_intent": 19, "aud_help": 15, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 24, "pfit_auth": 23, "pfit_pay": 22, "pfit_rep": 15, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "46K in 172 posts (268 followers/post velocity); explicit Higgsfield + ChatGPT focus; zero paid Whop course.",
    },
    {
        "handle": "@promptseen", "name": "Rutik Soni", "email": "contact@promptseen.com",
        "tier": "P1", "followers": 29000, "posts": 248, "niche": "#2 Applied AI Video (Flow AI Video & Image Prompts)",
        "er_est": 4.6, "avg_likes_est": 1260, "avg_comments_est": 74, "ratio_est": "17.0:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — High comment-for-prompt velocity",
        "price": 67, "product_concept": "Flow AI Video & Cinematic Prompt Engine + CapCut/VN Pack ($67)",
        "warm_sig": 15, "mon_intent": 18, "aud_help": 15, "active_cons": 15, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 24, "pfit_auth": 23, "pfit_pay": 20, "pfit_rep": 15, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "Verified active (Aug 2026 posts on promptseen.com & YT); 15M+ visitors; monetizes blog via ads only, zero structured $67-$97 Whop vault.",
    },
    {
        "handle": "@creagen.ai", "name": "CreaGen AI", "email": "creagen.ai.trends@gmail.com",
        "tier": "P1", "followers": 11000, "posts": 215, "niche": "#2 Applied AI Video & Workflow Automation",
        "er_est": 4.8, "avg_likes_est": 490, "avg_comments_est": 38, "ratio_est": "12.9:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Lead magnet CTA drives comment intent",
        "price": 79, "product_concept": "Done-For-You AI Content & Video Automation Playbook ($79)",
        "warm_sig": 15, "mon_intent": 18, "aud_help": 14, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 23, "pfit_auth": 22, "pfit_pay": 22, "pfit_rep": 14, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "Already captures leads via free '67 AI tools list' in bio but lacks a $79-$97 backend product + 14-day Stories launch.",
    },
    {
        "handle": "@learnaifaster", "name": "Learn AI Faster", "email": "learnaifasterx@gmail.com",
        "tier": "P1", "followers": 71000, "posts": 1498, "niche": "#2 Applied AI Video & Daily AI Workflows",
        "er_est": 3.1, "avg_likes_est": 2100, "avg_comments_est": 68, "ratio_est": "30.9:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Verified +30K growth (41K->71K across 221 posts)",
        "price": 79, "product_concept": "The Rapid AI Workflow & Video Implementation Vault ($79)",
        "warm_sig": 14, "mon_intent": 18, "aud_help": 14, "active_cons": 15, "contact": 10, "size_fit": 8, "niche_fit": 10,
        "pfit_pain": 23, "pfit_auth": 22, "pfit_pay": 22, "pfit_rep": 14, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "Verified organic growth from 41K (1,277 posts) to 71K (1,498 posts) = +136 followers/post; high posting consistency.",
    },
    {
        "handle": "@bossymiss", "name": "Preksha K", "email": "preksha.kap@gmail.com",
        "tier": "P1", "followers": 27000, "posts": 815, "niche": "#2 Applied AI Workflows, Data & Tech (SF/Delhi)",
        "er_est": 3.8, "avg_likes_est": 980, "avg_comments_est": 44, "ratio_est": "22.3:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Named founder (SuperAI / LinkedIn Top Voice)",
        "price": 97, "product_concept": "Practical AI & Data Automation Playbook for Tech Operators ($97)",
        "warm_sig": 14, "mon_intent": 18, "aud_help": 14, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 23, "pfit_auth": 24, "pfit_pay": 23, "pfit_rep": 14, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "Real face/voice authority (SF/Delhi, SuperAI cofounder, LinkedIn Top Voice); B2B/career buyer pool supports $97 price point.",
    },
    {
        "handle": "@yaisalinas", "name": "Yai Salinas", "email": "yai.salinas@gmail.com",
        "tier": "P1", "followers": 11000, "posts": 586, "niche": "#2 Applied AI Visuals & Typography (@bot_yai / @chromaticvoid01)",
        "er_est": 4.4, "avg_likes_est": 460, "avg_comments_est": 29, "ratio_est": "15.9:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — University lecturer (@morfologiawainhaus1)",
        "price": 79, "product_concept": "AI Visual Direction & Experimental Type Workflow Pack ($79)",
        "warm_sig": 14, "mon_intent": 17, "aud_help": 14, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 22, "pfit_auth": 24, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Real educator who already teaches university design (@morfologiawainhaus1) and runs 2 dedicated AI visual labs (@bot_yai, @chromaticvoid01).",
    },
    {
        "handle": "@saffvfx", "name": "Saf", "email": "Saffvisualfx@gmail.com",
        "tier": "P1", "followers": 45000, "posts": 44, "niche": "#2 Applied AI Video & After Effects VFX Tutorials",
        "er_est": 6.8, "avg_likes_est": 2950, "avg_comments_est": 110, "ratio_est": "26.8:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Extreme velocity (1,022 followers/post)",
        "price": 67, "product_concept": "After Effects + AI VFX Project File & Preset Vault ($67)",
        "warm_sig": 14, "mon_intent": 17, "aud_help": 15, "active_cons": 12, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 24, "pfit_auth": 23, "pfit_pay": 21, "pfit_rep": 15, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "45K followers from just 44 tutorial posts (1,022 followers/post); tutorial viewers constantly ask for AE project files & presets.",
    },
    {
        "handle": "@sysinacgi", "name": "Sysina", "email": "sysinacgi@outlook.com",
        "tier": "P1", "followers": 43000, "posts": 321, "niche": "#3 Blender 3D & Commercial CGI / UGC Workflows",
        "er_est": 4.5, "avg_likes_est": 1860, "avg_comments_est": 64, "ratio_est": "29.1:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Self-taught Blender + UGC positioning",
        "price": 79, "product_concept": "Self-Taught Blender 3D to Paid CGI & UGC Starter System ($79)",
        "warm_sig": 13, "mon_intent": 17, "aud_help": 14, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 23, "pfit_auth": 23, "pfit_pay": 22, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Clear 'self-taught Blender artist landing paid UGC + @wearetech_' transformation hook; ideal $79 system for 3D beginners.",
    },
    {
        "handle": "@maurosfilms", "name": "Mauro", "email": "maurosmedia@gmail.com",
        "tier": "P1", "followers": 13000, "posts": 1428, "niche": "#2 Applied Video Production, Lighting & Camera Workflows",
        "er_est": 3.9, "avg_likes_est": 480, "avg_comments_est": 32, "ratio_est": "15.0:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — High-trust 38yo cinematographer",
        "price": 79, "product_concept": "Solo Creator Lighting, Camera Setup & Color Grading Kit ($79)",
        "warm_sig": 13, "mon_intent": 17, "aud_help": 14, "active_cons": 15, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 22, "pfit_auth": 24, "pfit_pay": 23, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Older, gear-buying filmmaker demographic (high disposable income); 1,428 posts of consistent camera & lighting education.",
    },
    {
        "handle": "@kevin_gnu", "name": "Kevin Gnutzmans", "email": "gnutzmans@gmail.com",
        "tier": "P1", "followers": 24000, "posts": 338, "niche": "#3 Concept Art & AAA Studio Visual Workflows",
        "er_est": 4.3, "avg_likes_est": 990, "avg_comments_est": 36, "ratio_est": "27.5:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — AAA studio credits (Riot, Supercell, WotC)",
        "price": 79, "product_concept": "AAA Studio Concept Art Portfolio & Brush/Process Pack ($79)",
        "warm_sig": 13, "mon_intent": 16, "aud_help": 14, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 23, "pfit_auth": 25, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Elite studio credentials (Supercell, Riot Games, Wizards of the Coast); aspiring concept artists pay $79+ for studio-ready portfolio systems.",
    },
    {
        "handle": "@deeply.ai", "name": "Deepshikhar", "email": "deepshikhar2305@gmail.com",
        "tier": "P1", "followers": 9410, "posts": 923, "niche": "#2 Applied AI Tools & ChatGPT Workflows",
        "er_est": 3.6, "avg_likes_est": 320, "avg_comments_est": 22, "ratio_est": "14.5:1 (EST)",
        "comment_gate_status": "AMBER_SIZE (9.4K slightly under 10K floor) — Verify 12-post on reply",
        "price": 57, "product_concept": "The Top 1% AI Operator Prompt & Automation Vault ($57)",
        "warm_sig": 13, "mon_intent": 17, "aud_help": 13, "active_cons": 14, "contact": 10, "size_fit": 8, "niche_fit": 10,
        "pfit_pain": 21, "pfit_auth": 20, "pfit_pay": 19, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "9,410 followers is just below the 10K floor and Indian audience skews price-sensitive ($47-$57 optimal vs $97).",
    },
    {
        "handle": "@theaicolab", "name": "TheAICOLAB", "email": "Reloaded.v2@gmail.com",
        "tier": "P1", "followers": 12000, "posts": 777, "niche": "#2 Applied AI Art & Visual Generation",
        "er_est": 3.4, "avg_likes_est": 390, "avg_comments_est": 19, "ratio_est": "20.5:1 (EST)",
        "comment_gate_status": "AMBER_INTENT (Art showcase vs tutorial) — Verify buyer comments",
        "price": 57, "product_concept": "AI Visual Style & Prompt Consistency Blueprint ($57)",
        "warm_sig": 12, "mon_intent": 17, "aud_help": 12, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 20, "pfit_auth": 20, "pfit_pay": 18, "pfit_rep": 13, "pfit_up": 7,
        "verdict": "AMBER", "verdict_reason": "Sells prints via DM ('DM for Prints'), proving monetization intent, but audience may lean gallery-spectator unless angled around prompt consistency.",
    },
    # === TIER P2 (14 CREATORS - STAGED IN GMAIL DRAFTS ON 2026-10-08) ===
    {
        "handle": "@aatelier.ai", "name": "Aatelier AI", "email": "aatelier.ai@gmail.com",
        "tier": "P2", "followers": 10000, "posts": 171, "niche": "#2 Applied AI Architecture & Midjourney/ComfyUI Viz",
        "er_est": 4.1, "avg_likes_est": 390, "avg_comments_est": 24, "ratio_est": "16.3:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — High-ticket architecture/design buyer pool",
        "price": 79, "product_concept": "AI Architectural Visualization & Client Concept Workflow ($79)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 23, "pfit_auth": 21, "pfit_pay": 22, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Architects and interior/spatial designers gladly pay $79-$147 for repeatable AI concept visualization workflows.",
    },
    {
        "handle": "@devoidd", "name": "Devoidd", "email": "devoidd.art@gmail.com",
        "tier": "P2", "followers": 21000, "posts": 205, "niche": "#3 Character Concept Art & Visual Design",
        "er_est": 4.5, "avg_likes_est": 910, "avg_comments_est": 31, "ratio_est": "29.4:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Verify 12-post on reply",
        "price": 67, "product_concept": "Character Concept Design & Rendering Workflow Pack ($67)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 21, "pfit_auth": 22, "pfit_pay": 20, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "21K in 205 posts (102 followers/post); strong character design authority with zero structured digital course.",
    },
    {
        "handle": "@michaelwalchalk", "name": "Michael Walchalk", "email": "michaelwalchalk@gmail.com",
        "tier": "P2", "followers": 38000, "posts": 1925, "niche": "#3 Procreate & Adobe Illustrator Sports/Character Design",
        "er_est": 3.5, "avg_likes_est": 1280, "avg_comments_est": 38, "ratio_est": "33.7:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Lead Illustrator at @statmuse",
        "price": 79, "product_concept": "Procreate + Illustrator Vector Illustration System & Brush Kit ($79)",
        "warm_sig": 12, "mon_intent": 16, "aud_help": 13, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 22, "pfit_auth": 24, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "StatMuse illustrator credential + 1,925 posts of hand-drawn/Illustrator/Procreate work; obvious brush + workflow product fit.",
    },
    {
        "handle": "@domjaro", "name": "Dominic Jaro", "email": "jarodominic@gmail.com",
        "tier": "P2", "followers": 12000, "posts": 1320, "niche": "#3 AAA Video Game Concept Art (Back 4 Blood / Turtle Rock)",
        "er_est": 3.8, "avg_likes_est": 430, "avg_comments_est": 24, "ratio_est": "17.9:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Senior Concept Artist @turtlerockstudios",
        "price": 79, "product_concept": "AAA Game Environment & Creature Concept Art Blueprint ($79)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 22, "pfit_auth": 24, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Senior Concept Artist on Back 4 Blood; high-trust career skillset for aspiring game artists.",
    },
    {
        "handle": "@shellychenart", "name": "Shelly Chen", "email": "shellychenpro@gmail.com",
        "tier": "P2", "followers": 15000, "posts": 130, "niche": "#3 Character Design, VisDev & Art Direction",
        "er_est": 4.9, "avg_likes_est": 710, "avg_comments_est": 28, "ratio_est": "25.4:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — 115 followers/post efficiency",
        "price": 79, "product_concept": "Animation VisDev & Character Design Portfolio Playbook ($79)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 22, "pfit_auth": 23, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Art Director + VisDev positioning with 15K followers in only 130 posts; strong student/junior-artist buyer pool.",
    },
    {
        "handle": "@artwithkoda", "name": "Koda", "email": "workwithkoda@gmail.com",
        "tier": "P2", "followers": 45000, "posts": 1536, "niche": "#3 Character Design & Freelance Illustration",
        "er_est": 3.4, "avg_likes_est": 1480, "avg_comments_est": 42, "ratio_est": "35.2:1 (EST)",
        "comment_gate_status": "AMBER_RATIO — Verify 12-post comment intent on reply",
        "price": 67, "product_concept": "ADHD-Friendly Character Design & Freelance Artist System ($67)",
        "warm_sig": 12, "mon_intent": 16, "aud_help": 12, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 21, "pfit_auth": 21, "pfit_pay": 19, "pfit_rep": 13, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "Explicit 'Business propositions email workwithkoda@gmail.com' in bio, but older account (1,536 posts) requires 12-post recent velocity check.",
    },
    {
        "handle": "@evepaints", "name": "Eve", "email": "evepaintsmail@gmail.com",
        "tier": "P2", "followers": 10000, "posts": 217, "niche": "#3 Digital Painting & Visual Storytelling",
        "er_est": 4.0, "avg_likes_est": 380, "avg_comments_est": 19, "ratio_est": "20.0:1 (EST)",
        "comment_gate_status": "AMBER_SIZE (10K floor) — Verify 12-post on reply",
        "price": 57, "product_concept": "Digital Painting Color, Light & Brush Process Pack ($57)",
        "warm_sig": 11, "mon_intent": 14, "aud_help": 12, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 20, "pfit_auth": 20, "pfit_pay": 19, "pfit_rep": 13, "pfit_up": 7,
        "verdict": "AMBER", "verdict_reason": "Clean 10K micro-creator with zero monetization infrastructure, but needs 12-post comment-intent check to confirm tutorial vs gallery audience.",
    },
    {
        "handle": "@molegato_studios", "name": "Molegato", "email": "molegato@hotmail.com",
        "tier": "P2", "followers": 11000, "posts": 960, "niche": "#3 Blender 3D + Unity3D Indie Game Dev",
        "er_est": 4.2, "avg_likes_est": 440, "avg_comments_est": 26, "ratio_est": "16.9:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Technical Blender-to-Unity pipeline",
        "price": 79, "product_concept": "Blender-to-Unity Indie Game Asset & Rigging Pipeline ($79)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 14, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 23, "pfit_auth": 22, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Technical Blender + Unity3D game dev niche has high-pain workflow bottlenecks (rigging, shaders, FBX export) that convert well.",
    },
    {
        "handle": "@ajproductionsofficial", "name": "AJ Productions", "email": "ajproductionsofficialbeats@gmail.com",
        "tier": "P2", "followers": 11000, "posts": 210, "niche": "#2 Video Editing, Music Videos & Production Tutorials",
        "er_est": 4.3, "avg_likes_est": 450, "avg_comments_est": 27, "ratio_est": "16.7:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — Video FX & editing preset demand",
        "price": 67, "product_concept": "Music Video FX, Transitions & Sound Design Preset Vault ($67)",
        "warm_sig": 12, "mon_intent": 16, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 10, "niche_fit": 8,
        "pfit_pain": 22, "pfit_auth": 21, "pfit_pay": 20, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Video editors & music video creators consistently buy LUT/preset/transition packs ($47-$67).",
    },
    {
        "handle": "@3d.bysarah", "name": "Sarah", "email": "3dbysarah@gmail.com",
        "tier": "P2", "followers": 101000, "posts": 113, "niche": "#3 Blender 3D Cozy Scenes, Lighting & Materials",
        "er_est": 5.8, "avg_likes_est": 5650, "avg_comments_est": 145, "ratio_est": "39.0:1 (EST)",
        "comment_gate_status": "EST_PASS (<50:1) — 893 followers/post breakout velocity",
        "price": 79, "product_concept": "Cozy 3D Blender Scene, Lighting & Material Starter Kit ($79)",
        "warm_sig": 13, "mon_intent": 16, "aud_help": 15, "active_cons": 14, "contact": 10, "size_fit": 8, "niche_fit": 9,
        "pfit_pain": 24, "pfit_auth": 23, "pfit_pay": 21, "pfit_rep": 15, "pfit_up": 9,
        "verdict": "GREEN", "verdict_reason": "101K followers in just 113 posts (borderline 100K cap); massive demand for her exact cozy Blender lighting & material node setups.",
    },
    {
        "handle": "@vfxnanu", "name": "Vimal (Vfxnanu)", "email": "vimal.4amvfx@gmail.com",
        "tier": "P2", "followers": 107000, "posts": 322, "niche": "#2 Applied VFX & Compositing Breakdowns",
        "er_est": 4.1, "avg_likes_est": 4250, "avg_comments_est": 95, "ratio_est": "44.7:1 (EST)",
        "comment_gate_status": "AMBER_SIZE (107K slightly over 100K cap) — Verify buyer geos",
        "price": 57, "product_concept": "4AM VFX Compositing & Project Breakdown Pack ($57)",
        "warm_sig": 12, "mon_intent": 16, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 7, "niche_fit": 9,
        "pfit_pain": 22, "pfit_auth": 22, "pfit_pay": 18, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "107K followers (slightly above 100K sweet spot) + Indian audience requires $47-$57 regional pricing tier.",
    },
    {
        "handle": "@woman.engineer", "name": "Zeynep", "email": "zynpkck95@gmail.com",
        "tier": "P2", "followers": 108000, "posts": 388, "niche": "#2 Software Engineering, AI Coding & Tech Career",
        "er_est": 3.2, "avg_likes_est": 3350, "avg_comments_est": 62, "ratio_est": "54.0:1 (EST)",
        "comment_gate_status": "AMBER_RATIO (~54:1) — Verify 12-post comment depth",
        "price": 67, "product_concept": "AI-Assisted Coding & Junior-to-Senior Engineer Playbook ($67)",
        "warm_sig": 11, "mon_intent": 15, "aud_help": 13, "active_cons": 13, "contact": 10, "size_fit": 7, "niche_fit": 8,
        "pfit_pain": 21, "pfit_auth": 22, "pfit_pay": 20, "pfit_rep": 13, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "108K followers (slightly over 100K cap); mixes lifestyle dev reels with coding tips, so 12-post comment check is mandatory on reply.",
    },
    {
        "handle": "@artificialintelligencewing", "name": "AI Wing", "email": "aiwing.partnerships@gmail.com",
        "tier": "P2", "followers": 134000, "posts": 668, "niche": "#2 Daily AI Updates, Productivity & Workflows",
        "er_est": 2.2, "avg_likes_est": 2850, "avg_comments_est": 48, "ratio_est": "59.4:1 (EST)",
        "comment_gate_status": "AMBER_NEWS (Faceless AI news/updates page) — Verify comment ratio",
        "price": 67, "product_concept": "The Weekly AI Productivity & No-Code Automation Vault ($67)",
        "warm_sig": 11, "mon_intent": 17, "aud_help": 12, "active_cons": 14, "contact": 10, "size_fit": 6, "niche_fit": 9,
        "pfit_pain": 20, "pfit_auth": 19, "pfit_pay": 19, "pfit_rep": 13, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "134K followers (>100K cap) and news/updates pages typically have lower comment-to-like ratios than hands-on workflow builders.",
    },
    {
        "handle": "@algovaultai", "name": "AlgoVault AI", "email": "connectalgovault@gmail.com",
        "tier": "P2", "followers": 162000, "posts": 388, "niche": "#2 Simplified AI Tools & Solutions Vault",
        "er_est": 2.6, "avg_likes_est": 4100, "avg_comments_est": 78, "ratio_est": "52.6:1 (EST)",
        "comment_gate_status": "AMBER_SIZE (162K over 100K cap; already has link-in-bio resources)",
        "price": 79, "product_concept": "AlgoVault Done-For-You AI Implementation System ($79)",
        "warm_sig": 12, "mon_intent": 18, "aud_help": 13, "active_cons": 14, "contact": 10, "size_fit": 5, "niche_fit": 9,
        "pfit_pain": 21, "pfit_auth": 20, "pfit_pay": 20, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "162K followers (above 100K cap) and already funnels 'Get Resources Here!' in bio; pitch must position a premium backend cohort/Whop tier.",
    },
    # === BONUS APIFY-VERIFIED 2026 SCRAPED LEADS (EXACT REEL LIKES, VIEWS & ER FROM APIFY DATASET) ===
    {
        "handle": "@gfx_ma", "name": "Max (AI Creative Director)", "email": "magfx170@gmail.com",
        "tier": "P1_NEW_APIFY", "followers": 19145, "posts": 59, "niche": "#2 Applied AI Video & AI Brand Campaigns (Creative AI Studio)",
        "er_est": 14.46, "avg_likes_est": 5294, "avg_comments_est": 165, "ratio_est": "32.1:1 (SCRAPED_ER_14.46%)",
        "comment_gate_status": "VERIFIED_APIFY (14.46% ER, 5,294 avg reel likes, 37,374 avg views, ZERO bio link!)",
        "price": 97, "product_concept": "Solo AI Brand Campaign & Commercial Video Director Playbook ($97)",
        "warm_sig": 16, "mon_intent": 19, "aud_help": 15, "active_cons": 15, "contact": 10, "size_fit": 10, "niche_fit": 10,
        "pfit_pain": 25, "pfit_auth": 24, "pfit_pay": 24, "pfit_rep": 15, "pfit_up": 10,
        "verdict": "GREEN", "verdict_reason": "Apify-verified 14.46% ER (5,294 avg likes/reel, 37.4K avg views/reel on 19.1K followers) + ZERO website/link-in-bio + UK AI video studio.",
    },
    {
        "handle": "@josephbadiger", "name": "Josephbadiger", "email": "Workjosephbadiger@gmail.com",
        "tier": "P1_NEW_APIFY", "followers": 36422, "posts": 129, "niche": "#2 AI Web/Design Workflows & Productivity",
        "er_est": 4.07, "avg_likes_est": 1483, "avg_comments_est": 64, "ratio_est": "23.2:1 (SCRAPED_ER_4.07%)",
        "comment_gate_status": "VERIFIED_APIFY (4.07% ER, 1,483 avg reel likes, 21,661 avg views)",
        "price": 79, "product_concept": "High-Converting AI Website & Client Delivery System ($79)",
        "warm_sig": 14, "mon_intent": 18, "aud_help": 14, "active_cons": 14, "contact": 10, "size_fit": 10, "niche_fit": 9,
        "pfit_pain": 23, "pfit_auth": 23, "pfit_pay": 21, "pfit_rep": 14, "pfit_up": 8,
        "verdict": "GREEN", "verdict_reason": "Apify-verified 4.07% ER (1,483 avg likes/reel, 21.6K avg views/reel); 200+ websites built, only links agency site (no digital product).",
    },
    {
        "handle": "@galinie_codes", "name": "Galinie", "email": "galinie@undercurrent.net",
        "tier": "P2_NEW_APIFY", "followers": 70912, "posts": 544, "niche": "#2 AI Curious, Tech & Coding Workflows (Canada)",
        "er_est": 7.34, "avg_likes_est": 8334, "avg_comments_est": 140, "ratio_est": "59.5:1 (SCRAPED_ER_7.34%)",
        "comment_gate_status": "AMBER_MGMT (undercurrent.net talent email) — 7.34% ER, 119K avg reel views",
        "price": 79, "product_concept": "AI-Powered Developer & Tech Lifestyle Productivity Kit ($79)",
        "warm_sig": 12, "mon_intent": 15, "aud_help": 13, "active_cons": 15, "contact": 9, "size_fit": 8, "niche_fit": 8,
        "pfit_pain": 20, "pfit_auth": 21, "pfit_pay": 21, "pfit_rep": 13, "pfit_up": 8,
        "verdict": "AMBER", "verdict_reason": "Apify-verified 7.34% ER (119.2K avg views/reel), but email is talent management (galinie@undercurrent.net) and content leans tech comedy.",
    },
]

def run_all():
    rows_out = []
    md_lines = [
        "# Shadow Operator — Monetization Verdicts & 5-Framework Revenue Assessment",
        "**Generated:** 2026-10-08 | **Engine:** `tools/revenue_model.py` (Tri-Model) + Drive `bgm_vault_revenue.jsx` (F1–F5) + `prompts/01_scout_and_vet.md` (8-Gate `/vet`)",
        "",
        "## 1. Executive Summary of Verdicts",
        "- **Total Assessed Creators:** 29 (`12 Tier-P1 Sent` + `14 Tier-P2 Drafts` + `3 Bonus Apify-Scraped Verified Leads`)",
        "- **Monetization Verdicts:**",
        "  - **`GREEN` (Proceed & Prioritize Audit on Reply):** **20 creators** (`10` in P1, `8` in P2, `2` in Apify-Verified Bonus)",
        "  - **`AMBER` (Proceed with Caution / Verify 12-Post Comment Gate or Regional Price Tier):** **9 creators** (`@deeply.ai`, `@theaicolab`, `@artwithkoda`, `@evepaints`, `@vfxnanu`, `@woman.engineer`, `@artificialintelligencewing`, `@algovaultai`, `@galinie_codes`)",
        "  - **`RED` (Kill / Do Not Pitch):** `@richlegacy.co` (`374:1` ratio — KILLED)",
        "",
        "## 2. Full Creator Monetization Verdict & Revenue Projection Table",
        "",
        "| # | Handle | Tier | Followers | ER% | Likes / Comments (Ratio) | Conv. Score | Prod-Fit | Verdict | Price | Headline Launch (Lower of Comment/Funnel) | Comment-Anchored (`pool x 3`) | Naive Ceiling (Workbook) | Drive F3 Sub Stack MRR | Flagship Product Concept |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"
    ]

    for idx, c in enumerate(CREATOR_ASSESSMENTS, 1):
        tm = tri_model_revenue(c["followers"], c["er_est"], c["avg_comments_est"], c["price"], 0.40)
        bgm = bgm_vault_5_frameworks(
            c["followers"], c["er_est"], c["avg_likes_est"], c["avg_comments_est"], c["price"]
        )

        conv_score = (
            c["warm_sig"] + c["mon_intent"] + c["aud_help"]
            + c["active_cons"] + c["contact"] + c["size_fit"] + c["niche_fit"]
        )
        pfit_score = (
            c["pfit_pain"] + c["pfit_auth"] + c["pfit_pay"] + c["pfit_rep"] + c["pfit_up"]
        )

        c["conv_score"] = conv_score
        c["pfit_score"] = pfit_score
        c["headline_range"] = f"${tm['hl_low']:,.0f}-${tm['hl_base']:,.0f} (40% op: ${tm['op_base']:,.0f})"
        c["comment_range"] = f"${tm['ca_low']:,.0f}-${tm['ca_base']:,.0f}-${tm['ca_high']:,.0f} ({tm['pool']} pool)"
        c["naive_ceiling"] = f"${tm['naive_gross']:,.0f} ({tm['gap_x']:.0f}x gap)"
        c["f3_mrr"] = bgm["f3_substack_mrr"]
        c["f1_brand"] = bgm["f1_brand_post"]
        rows_out.append(c)

        md_lines.append(
            f"| {idx} | **{c['handle']}** ({c['name']}) | `{c['tier']}` | {c['followers']:,} | {c['er_est']:.2f}% | "
            f"{c['avg_likes_est']:,} / {c['avg_comments_est']} (`{c['ratio_est']}`) | **{conv_score}/100** | **{pfit_score}/100** | "
            f"**{c['verdict']}** | ${c['price']} | **{c['headline_range']}** | {c['comment_range']} | {c['naive_ceiling']} | {c['f3_mrr']} | {c['product_concept']} |"
        )

    md_lines.extend([
        "",
        "## 3. Creator-by-Creator Monetization Verdict Notes & 12-Post Gate Status",
        ""
    ])
    for c in rows_out:
        md_lines.append(
            f"- **{c['handle']}** (`{c['email']}`) — **Verdict: `{c['verdict']}`** | Conv: `{c['conv_score']}/100` | Product-Fit: `{c['pfit_score']}/100`\n"
            f"  - **12-Post Comment Gate:** `{c['comment_gate_status']}` | **Comment-Anchored Math (`avg_comments × 3`):** `{c['comment_range']}`\n"
            f"  - **Headline Launch (`tools/revenue_model.py`):** **{c['headline_range']}** | **Workbook Naive Ceiling:** `{c['naive_ceiling']}` | **Drive F3 Sub Stack:** `{c['f3_mrr']}` | **F1 Brand Rate:** `{c['f1_brand']}`\n"
            f"  - **Why:** {c['verdict_reason']}"
        )

    out_path = os.path.join(REPO_ROOT, "MONETIZATION_VERDICTS.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines) + "\n")
    print(f"Wrote {out_path} with {len(rows_out)} full creator assessments.")

if __name__ == "__main__":
    run_all()

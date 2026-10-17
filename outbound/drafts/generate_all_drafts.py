import csv, re, os

with open('templates/creator_tracker.csv', 'r') as f:
    rows = list(csv.DictReader(f))

draftable = []
for r in rows:
    status = r.get('status','')
    channel = r.get('channel','')
    if status == 'DISCOVERED' and '@' in channel:
        email = re.findall(r'[\w.+-]+@[\w.-]+\.\w+', channel)
        if email:
            draftable.append({
                'handle': r['handle'],
                'email': email[0],
                'followers': int(r.get('followers', 0) or 0),
                'niche': r.get('niche',''),
            })

# Hook variations — rotate to avoid template feel
hooks = [
    "The pattern I keep seeing is people asking for the workflow, the preset pack, or the full setup, and there being nothing to sell them yet.",
    "People keep asking pages like yours for the tutorial, the project file, or the tool breakdown, and there is nothing to buy yet.",
    "The pattern I keep seeing is creators with real demand in the comments but no product behind the page to capture it.",
    "People keep asking for your process, your settings, your full breakdown, and there is nothing packaged for them yet.",
]

openers = [
    "I came across {handle} while looking at {niche_short} pages where the audience clearly wants more depth, not just surface-level tips.",
    "I found {handle} while scanning {niche_short} creators who actually ship work and have buyers asking in the comments.",
    "I came across your page while looking at {niche_short} creators whose audience is clearly ready to buy, not just scroll.",
    "I found {handle} while looking at {niche_short} pages with real engagement and nothing for the audience to purchase.",
]

os.makedirs('outbound/drafts', exist_ok=True)

for i, lead in enumerate(draftable):
    handle = lead['handle']
    email = lead['email']
    niche = lead['niche']
    followers = lead['followers']
    
    # Extract short name for greeting
    name_part = handle.replace('@','').replace('.',' ').replace('_',' ').split()[0].title()
    if name_part in ('Ai', '3d', 'Figma'):
        greeting = "Hey,"
    else:
        greeting = f"Hey {name_part},"
    
    # Short niche for opener
    niche_map = {
        'Niche #2': 'AI tools and workflow',
        'Niche #1': 'motion design and video editing',
        'Niche #3': '3D art and digital design',
        'Adjacent': 'creative design',
    }
    niche_short = 'creative'
    for k, v in niche_map.items():
        if k in niche:
            niche_short = v
            break
    
    hook = hooks[i % len(hooks)]
    opener = openers[i % len(openers)].format(handle=handle, niche_short=niche_short)
    
    body = f"""{greeting}

{opener}

{hook}

I build the product, the storefront and the support. You bring the audience. Revenue splits 60/40 in your favour, no fee, nothing paid until it sells.

Worth a conversation?

Scott
Shadow Operator

Reply STOP and I will not follow up."""
    
    word_count = len(body.split())
    
    filename = f"outbound/drafts/draft_{i+2:03d}_{handle.replace('@','').replace('.','_').replace('__','_')}.txt"
    with open(filename, 'w') as f:
        f.write(f"DRAFT — NOT SENT — operator sends manually\n\n")
        f.write(f"TO: {email}\n")
        f.write(f"SUBJECT: your {niche_short} work + a product idea for {handle}\n")
        f.write(f"---\n\n{body}")
    
    print(f"{i+2:3d}. {handle:30s} | {followers//1000:3d}K | {email:35s} | {word_count}w | {filename}")

print(f"\nTotal drafts generated: {len(draftable)}")
print(f"Total with draft_001: {len(draftable) + 1}")

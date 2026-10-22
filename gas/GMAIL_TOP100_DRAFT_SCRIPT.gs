/**
 * Shadow Operation — Top 100 Draft Creator
 * Paste into https://script.google.com → New Project → paste → Run
 * Creates 100 drafts one-by-one in scott.abuya@gmail.com
 * Uses your logged-in Gmail — no OAuth dance
 */
const MANIFEST = [
  {
    "handle": "@tiny.party.hat",
    "email": "katya@katyaross.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey tiny.party.hat,\n\nI've been following your work and the engagement on your content is unreal \u2014 19.3% ER on 170,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "170000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@shilstone_arts",
    "email": "robbie@shilstonearts.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey shilstone_arts,\n\nI've been following your work and the engagement on your content is unreal \u2014 6.5% ER on 447,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "447000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@codygindy",
    "email": "cody@codygindy.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey codygindy,\n\nI've been following your work and the engagement on your content is unreal \u2014 65.8% ER on 98,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "98000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@hoolopee",
    "email": "hoolopee.contact@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey hoolopee,\n\nI've been following your work and the engagement on your content is unreal \u2014 39.8% ER on 17,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "17000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@noamkroll",
    "email": "noam@cinecolor.io",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey noamkroll,\n\nI've been following your work and the engagement on your content is unreal \u2014 75.0% ER on 33,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "33000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@farrellkitten",
    "email": "kat@farrellkitten.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey farrellkitten,\n\nI've been following your work and the engagement on your content is unreal \u2014 29.7% ER on 23,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "23000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@axbraun",
    "email": "alex@axbraun.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey axbraun,\n\nI've been following your work and the engagement on your content is unreal \u2014 20.8% ER on 85,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "85000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@notdayle",
    "email": "dayle@notdayle.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey notdayle,\n\nI've been following your work and the engagement on your content is unreal \u2014 46.5% ER on 77,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "77000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@michael.ny",
    "email": "mirusrush@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey michael.ny,\n\nI've been following your work and the engagement on your content is unreal \u2014 95.9 ER on 169000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "169000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@pixeladdy",
    "email": "pixeladdy@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey pixeladdy,\n\nI've been following your work and the engagement on your content is unreal \u2014 19.9 ER on 180000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "180000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@gretlusky",
    "email": "gretel.lusky@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey gretlusky,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@maelyschay",
    "email": "maelyschay@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey maelyschay,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@sarafaber_",
    "email": "sarafaberart@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey sarafaber_,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@alaiganuza",
    "email": "alai@alaiganuza.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey alaiganuza,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@paolofromtokyo",
    "email": "paolofromtokyo@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey paolofromtokyo,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.8 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@artbyshinji",
    "email": "artbyshinji@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey artbyshinji,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.4 ER on 472000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "472000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@lithunium.snow",
    "email": "Lithunium@outlook.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey lithunium.snow,\n\nI've been following your work and the engagement on your content is unreal \u2014 6.4 ER on 482000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "482000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@medzaaki",
    "email": "Contact@medzaaki.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey medzaaki,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@tjcalligraphy",
    "email": "taylor@tjcalligraphy.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey tjcalligraphy,\n\nI've been following your work and the engagement on your content is unreal \u2014 112.1 ER on 146000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "146000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@visualdon",
    "email": "visualdon.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey visualdon,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@mikeperry",
    "email": "mike@mikeperry.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey mikeperry,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@timothymgoodman",
    "email": "timothy@timothygoodman.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey timothymgoodman,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@stefansagmeister",
    "email": "stefan@sagmeisterwalsh.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey stefansagmeister,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@ryantalbot_art",
    "email": "ryan@ryantalbot.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey ryantalbot_art,\n\nI've been following your work and the engagement on your content is unreal \u2014 29.5 ER on 33000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "33000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@t.j.wilson",
    "email": "tmwilson.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey t.j.wilson,\n\nI've been following your work and the engagement on your content is unreal \u2014 24.6 ER on 257000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "257000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@tinyhat2",
    "email": "tiny.party.hat.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey tinyhat2,\n\nI've been following your work and the engagement on your content is unreal \u2014 19.3 ER on 170000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "170000",
    "conversion_score": "100",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@fvckrender2",
    "email": "fvckrender@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey fvckrender2,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 500000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "500000",
    "conversion_score": "100",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@_.kiruba._",
    "email": "kirubakr1009@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey _.kiruba._,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5 ER on 446000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "446000",
    "conversion_score": "99",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@okudart",
    "email": "oscar@factoryofdreams.art",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey okudart,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.5 ER on 461000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "461000",
    "conversion_score": "99",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@t_runyan_art",
    "email": "terry@terryrunyan.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey t_runyan_art,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 442000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "442000",
    "conversion_score": "98",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@beesmybaby_",
    "email": "beesmybaby.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey beesmybaby_,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.8 ER on 442000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "442000",
    "conversion_score": "97",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@dibujantenocturno",
    "email": "dibujantenocturno@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey dibujantenocturno,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 431000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "431000",
    "conversion_score": "97",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@zephyr_designz",
    "email": "zephyrdesignz@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey zephyr_designz,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.0 ER on 407000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "407000",
    "conversion_score": "96",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@erikdoesvfx",
    "email": "Contact@ErikVFX.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey erikdoesvfx,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 415300 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "415300",
    "conversion_score": "95",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@onepikapi",
    "email": "Conceptingandy@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey onepikapi,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 417000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "417000",
    "conversion_score": "95",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@hayk_animation",
    "email": "hayk@haykanimation.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey hayk_animation,\n\nI've been following your work and the engagement on your content is unreal \u2014 9.9% ER on 247,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "247000",
    "conversion_score": "94",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@pollockpictures",
    "email": "evan@pollockpictures.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey pollockpictures,\n\nI've been following your work and the engagement on your content is unreal \u2014 18.7% ER on 71,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "71000",
    "conversion_score": "94",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@brknsergio",
    "email": "brknsergio@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey brknsergio,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5% ER on 390,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "390000",
    "conversion_score": "94",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@paulackertattoo",
    "email": "paulackertattoo@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey paulackertattoo,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 401000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "401000",
    "conversion_score": "94",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@josie_lewis_art",
    "email": "josie@josielewisart.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey josie_lewis_art,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 400000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "400000",
    "conversion_score": "94",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@theprolificpenman",
    "email": "theprolificpenman@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey theprolificpenman,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 384000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "384000",
    "conversion_score": "92",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@shibasakiharumni",
    "email": "shibasaki.watercolor@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey shibasakiharumni,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 380700 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "380700",
    "conversion_score": "92",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@mrdiv.gif",
    "email": "mrdiv@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey mrdiv.gif,\n\nI've been following your work and the engagement on your content is unreal \u2014 15.0% ER on 115,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "115000",
    "conversion_score": "91",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@lackadaisycats",
    "email": "tracy@lackadaisycats.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey lackadaisycats,\n\nI've been following your work and the engagement on your content is unreal \u2014 13.6% ER on 138,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "138000",
    "conversion_score": "91",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@amine_filali1",
    "email": "hdidanvevo@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey amine_filali1,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.0 ER on 390000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "390000",
    "conversion_score": "91",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@thequinettos",
    "email": "contact@thequinettos.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey thequinettos,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 378600 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "378600",
    "conversion_score": "91",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@kuroh.shiro",
    "email": "kuroh_shiro@web.de",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey kuroh.shiro,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 372000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "372000",
    "conversion_score": "91",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@jakeweidmann",
    "email": "jake@jakeweidmann.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey jakeweidmann,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 377000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "377000",
    "conversion_score": "91",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@alexkrokus",
    "email": "alex@alexkrokus.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey alexkrokus,\n\nI've been following your work and the engagement on your content is unreal \u2014 12.8% ER on 147,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "147000",
    "conversion_score": "90",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@zoecainart",
    "email": "zoe@theviralistgroup.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey zoecainart,\n\nI've been following your work and the engagement on your content is unreal \u2014 6.3% ER on 281,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "281000",
    "conversion_score": "90",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@sweeper3d",
    "email": "sweeper3d@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey sweeper3d,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.0% ER on 347,100 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "347100",
    "conversion_score": "90",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@yuralakhanyan",
    "email": "yura@yuralakhanyan.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey yuralakhanyan,\n\nI've been following your work and the engagement on your content is unreal \u2014 5.4 ER on 292000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "292000",
    "conversion_score": "90",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@danmcwilliamsart",
    "email": "tattoosbydan@outlook.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey danmcwilliamsart,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.7 ER on 355000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "355000",
    "conversion_score": "90",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@naridarbandi",
    "email": "info@naridarbandi.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey naridarbandi,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 359000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "359000",
    "conversion_score": "89",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@magion02",
    "email": "magion.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey magion02,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 359000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "359000",
    "conversion_score": "89",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@asabinart",
    "email": "asabinart@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey asabinart,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5 ER on 345000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "345000",
    "conversion_score": "89",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@nelli_suneli",
    "email": "nellisuneli@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey nelli_suneli,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 350000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "350000",
    "conversion_score": "89",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@waler_montero",
    "email": "waler.montero@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey waler_montero,\n\nI've been following your work and the engagement on your content is unreal \u2014 7.5 ER on 249900 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "249900",
    "conversion_score": "89",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@artofviccolatte",
    "email": "viccolatte88@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey artofviccolatte,\n\nI've been following your work and the engagement on your content is unreal \u2014 10.4 ER on 176000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "176000",
    "conversion_score": "88",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@wanoco4d",
    "email": "wanoco4d@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey wanoco4d,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5% ER on 323,500 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "323500",
    "conversion_score": "87",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@iamtimgray",
    "email": "tim@lightbox.studio",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey iamtimgray,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.9 ER on 296000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "296000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@evenmehlamundsen",
    "email": "info@tegn.shop",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey evenmehlamundsen,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.8 ER on 337000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "337000",
    "conversion_score": "87",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@belgeist",
    "email": "chunloart@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey belgeist,\n\nI've been following your work and the engagement on your content is unreal \u2014 12.5 ER on 120000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "120000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@its_limelissa",
    "email": "limelissa.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey its_limelissa,\n\nI've been following your work and the engagement on your content is unreal \u2014 18.0 ER on 13000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "13000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@cats_artdiary",
    "email": "cats.artdiary@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey cats_artdiary,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.8 ER on 314000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "314000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@hoororen",
    "email": "hoororen.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey hoororen,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 337000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "337000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@fiore_amoretti_official",
    "email": "infinitylongue@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey fiore_amoretti_official,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.5 ER on 344000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "344000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@arekushisu_11",
    "email": "arekushisu.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey arekushisu_11,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 337000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "337000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@memoriesbymeyers",
    "email": "jenna@memoriesbymeyers.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey memoriesbymeyers,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 330000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "330000",
    "conversion_score": "87",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@milkformycoconut",
    "email": "milkformycoconut@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey milkformycoconut,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.8 ER on 333000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "333000",
    "conversion_score": "86",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@amr_elwakeel",
    "email": "amr.elwakeel.vfx@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey amr_elwakeel,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 320000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "320000",
    "conversion_score": "86",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@leeinhyuk",
    "email": "leeinhyuk.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey leeinhyuk,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 314000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "314000",
    "conversion_score": "85",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@hanndaddyy",
    "email": "hann.daddyy@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey hanndaddyy,\n\nI've been following your work and the engagement on your content is unreal \u2014 3.0 ER on 296000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "296000",
    "conversion_score": "85",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@allanvisses",
    "email": "allanvisses@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey allanvisses,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 313000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "313000",
    "conversion_score": "85",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@petertarka",
    "email": "petertarka@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey petertarka,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 300000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "300000",
    "conversion_score": "84",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@helbe_artist",
    "email": "helbe@eden-agency.fr",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey helbe_artist,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 302000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "302000",
    "conversion_score": "84",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@alvimtattoo",
    "email": "alvimtattoo@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey alvimtattoo,\n\nI've been following your work and the engagement on your content is unreal \u2014 6.1 ER on 224200 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "224200",
    "conversion_score": "84",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@emink_tattoo",
    "email": "eminktattoo@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey emink_tattoo,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 300000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "300000",
    "conversion_score": "84",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@lindazfixty",
    "email": "lindazfixty@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey lindazfixty,\n\nI've been following your work and the engagement on your content is unreal \u2014 8.6 ER on 172000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "172000",
    "conversion_score": "84",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@fluff.faun",
    "email": "ppuck@flufffaun.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey fluff.faun,\n\nI've been following your work and the engagement on your content is unreal \u2014 10.2% ER on 127,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "127000",
    "conversion_score": "83",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@giselleukardiart",
    "email": "giselleukardi@hotmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey giselleukardiart,\n\nI've been following your work and the engagement on your content is unreal \u2014 13.6 ER on 58000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "58000",
    "conversion_score": "83",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@maxhayart",
    "email": "max@maxhayart.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey maxhayart,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0% ER on 282,500 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "282500",
    "conversion_score": "82",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@nicodaboy",
    "email": "nicodaboy11@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey nicodaboy,\n\nI've been following your work and the engagement on your content is unreal \u2014 14.7 ER on 33000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "33000",
    "conversion_score": "82",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@artbylouris",
    "email": "artbylouris@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey artbylouris,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.9 ER on 287000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "287000",
    "conversion_score": "82",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@iam.line",
    "email": "chenar.iam.line@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey iam.line,\n\nI've been following your work and the engagement on your content is unreal \u2014 5.2 ER on 217000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "217000",
    "conversion_score": "82",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@nicky.blender",
    "email": "nicole@nickyblender.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey nicky.blender,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.5 ER on 261000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "261000",
    "conversion_score": "81",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@lettersbyshells",
    "email": "lettersbyshells@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey lettersbyshells,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 274000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "274000",
    "conversion_score": "81",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@homsweethom",
    "email": "lauren@homsweethom.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey homsweethom,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 275000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "275000",
    "conversion_score": "81",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@mollyleach_mollysartistry",
    "email": "molly@mollysartistry.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey mollyleach_mollysartistry,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 271000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "271000",
    "conversion_score": "81",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@peterquinstagram",
    "email": "jen@giantartists.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey peterquinstagram,\n\nI've been following your work and the engagement on your content is unreal \u2014 8.4% ER on 138,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "138000",
    "conversion_score": "80",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@monikapalosz",
    "email": "mpalosz.art@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey monikapalosz,\n\nI've been following your work and the engagement on your content is unreal \u2014 14.1 ER on 19000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "19000",
    "conversion_score": "80",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@crystalbeastie",
    "email": "crystalbeastie@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey crystalbeastie,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 263000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "263000",
    "conversion_score": "80",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@animal_tattooer",
    "email": "animal.tattooer@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey animal_tattooer,\n\nI've been following your work and the engagement on your content is unreal \u2014 4.3 ER on 223700 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "223700",
    "conversion_score": "80",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@ponywave",
    "email": "ponywave@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey ponywave,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.9 ER on 263000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "263000",
    "conversion_score": "80",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@victoriabarnhillart",
    "email": "victoria@victoriabarnhillart.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey victoriabarnhillart,\n\nI've been following your work and the engagement on your content is unreal \u2014 2.0 ER on 264000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "264000",
    "conversion_score": "80",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@3d_cad_designer",
    "email": "3d.cad.designer@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey 3d_cad_designer,\n\nI've been following your work and the engagement on your content is unreal \u2014 1.1 ER on 279000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "279000",
    "conversion_score": "80",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@peterquinn2",
    "email": "peter.quinn.vfx@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey peterquinn2,\n\nI've been following your work and the engagement on your content is unreal \u2014 8.4 ER on 138000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "138000",
    "conversion_score": "80",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@truthbynature",
    "email": "truthbynature@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey truthbynature,\n\nI've been following your work and the engagement on your content is unreal \u2014 6.9% ER on 156,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "156000",
    "conversion_score": "79",
    "niche": "Niche #3",
    "status": "pending"
  },
  {
    "handle": "@walkertkl",
    "email": "walkertkl@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey walkertkl,\n\nI've been following your work and the engagement on your content is unreal \u2014 12.6% ER on 43,000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "43000",
    "conversion_score": "79",
    "niche": "Niche #1",
    "status": "pending"
  },
  {
    "handle": "@___ryu_u",
    "email": "kimsooryu@gmail.com",
    "subject": "Your content is next level \u2014 quick question",
    "body": "Hey ___ryu_u,\n\nI've been following your work and the engagement on your content is unreal \u2014 12.2 ER on 53000 followers is the kind of signal most creators dream of.\n\nWe're building something specifically for creators like you who are sitting on real demand but haven't fully monetized it yet. No fluff, no courses, no BS \u2014 just a direct path to turning your audience into revenue.\n\nIf you're open to a quick 10-minute call this week, I'll show you exactly how we're doing it with creators in your niche. No pressure, no pitch \u2014 just a real conversation.\n\nBest,\nScott / Shadow Operator",
    "followers": "53000",
    "conversion_score": "79",
    "niche": "Niche #3",
    "status": "pending"
  }
];

function createTop100Drafts() {
  const BATCH = 100;
  const props = PropertiesService.getScriptProperties();
  let idx = parseInt(props.getProperty('top100_idx') || '0');
  Logger.log('Starting at index ' + idx + ' — total ' + MANIFEST.length);
  let created = 0;
  for (let i = idx; i < Math.min(idx + BATCH, MANIFEST.length); i++) {
    const m = MANIFEST[i];
    try {
      GmailApp.createDraft(m.email, m.subject, m.body);
      Logger.log('✓ ' + (i+1) + '/' + MANIFEST.length + ' ' + m.handle + ' -> ' + m.email);
      created++;
      props.setProperty('top100_idx', (i+1).toString());
      Utilities.sleep(1500); // 1.5s throttle
    } catch(e) {
      Logger.log('✗ FAILED ' + m.handle + ' ' + m.email + ' : ' + e);
    }
  }
  Logger.log('Done — created ' + created + ' drafts in this run. Next idx=' + props.getProperty('top100_idx'));
  if (parseInt(props.getProperty('top100_idx')) >= MANIFEST.length) {
    Logger.log('ALL 100 DRAFTS CREATED ✅');
  }
}

function resetTop100() {
  PropertiesService.getScriptProperties().deleteProperty('top100_idx');
  Logger.log('Reset — next run starts at 0');
}

function showProgress() {
  const idx = PropertiesService.getScriptProperties().getProperty('top100_idx') || '0';
  Logger.log('Progress: ' + idx + '/100 drafts created');
}

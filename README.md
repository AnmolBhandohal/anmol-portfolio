# Portfolio — Anmol Bhandohal

Live: *(deploy first — see below)*

---

## The one file you edit

**`js/content.js`** is the single source of truth. Your contact details, every project,
every case study, and the skills list all live there. The landing page, all case-study
pages, the command palette, and the sitemap are generated from it.

You should never need to touch HTML.

---

## Before you deploy — 3 blocking items

Run this first:

```bash
python build.py check
```

It currently reports **3 blockers**, all in `js/content.js` at the top:

```js
email:   'you@example.com',              // ← your real email
github:  'https://github.com/yourname',  // ← your real GitHub
linkedin:'https://linkedin.com/in/yourname',
```

Then re-run `check` until it's clean.

---

## Commands

```bash
python build.py check     # pre-flight: placeholders, missing files, warnings
python build.py serve     # local dev server, opens browser
python build.py new       # scaffold a new project (interactive)
python build.py seo       # regenerate sitemap.xml + robots.txt
python build.py deploy    # deployment instructions
```

---

## Adding a project

```bash
python build.py new
```

Answer two questions, then fill in the `TODO` fields it writes into `content.js`.
The scaffold includes a case-study skeleton with the four sections that matter:

1. **Why this exists** — the honest origin
2. **The key decision** — the fork in the road, and why
3. **What went wrong** — *don't skip this one; it's the most interesting section to a recruiter*
4. **What I'd do differently** — shows self-assessment

### Adding a photo
Drop the image in `img/` and set `photo:'img/name.jpg'` on the project.
It replaces the schematic automatically, everywhere.

### Adding a repo link
Set `repo:'https://github.com/you/repo'`. "Show me the code" is the #1 recruiter ask.

---

## What's built in

| Feature | Notes |
|---|---|
| **At a glance** section | Problem → Result for every project, above the fold. Recruiters average **7.4 seconds** on a first screen — this is for them |
| **Case study pages** | `project.html?p=<id>` — full depth, code samples, prev/next |
| **Command palette** | `⌘K` / `Ctrl+K` / `/` — jump to any project or action |
| **Motion toggle** | Nav button; preference saved to localStorage |
| **Reading progress** | Bar at top of case studies |
| **Keyboard nav** | `←` `→` between projects, `Esc` back to work |
| **SEO** | Meta tags, Open Graph, JSON-LD `Person` schema, sitemap |
| **Accessibility** | Skip link, focus rings, `prefers-reduced-motion`, semantic HTML |
| **Loader failsafe** | If a CDN is blocked, the page still shows everything |

---

## Deploy

**Cloudflare Pages** (recommended — fastest CDN, free, custom domains):
1. Push this folder to GitHub
2. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
3. Build command: *(empty)* · Output directory: `/`

**Netlify Drop** (fastest, no git): drag this folder onto app.netlify.com/drop

**GitHub Pages**: push to `USER.github.io` repo.

Then update `SITE.url` in `content.js` and re-run `python build.py seo`.

> **Buy a domain.** `anmolbhandohal.com` costs ~$12/yr and reads far better on a résumé
> than a `github.io` subdomain. You can point email at it too.

---

## Still worth doing

- [ ] Real contact details (blocking — `build.py check` will tell you)
- [ ] Résumé PDF in the folder + `resume:'resume.pdf'` in content.js
- [ ] **Photos of your actual boards** — the single biggest visual upgrade available
- [ ] GitHub repo links on projects
- [ ] `og.png` (1200×630) — what shows when you paste the link in Slack/LinkedIn
- [ ] Custom domain

---

## Architecture notes

- **No build step, no framework.** Plain HTML/CSS/JS. It'll still work in ten years.
- **GSAP + Lenis + ScrollTrigger** via CDN for motion.
- **Critical:** Lenis drives its RAF through GSAP's ticker — one animation loop, not two.
  Two competing loops is the #1 cause of scroll jank and it's architectural, not tunable.
- `js/study.js` is wrapped in an IIFE. Without it, `const p` collides with a global and
  the case-study page silently renders blank.

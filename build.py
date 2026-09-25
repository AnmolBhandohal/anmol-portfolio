#!/usr/bin/env python3
"""
build.py — portfolio maintenance toolkit.

    python build.py check     verify links, images, placeholders  (RUN BEFORE DEPLOY)
    python build.py seo       regenerate sitemap.xml + robots.txt
    python build.py serve     local dev server
    python build.py new       scaffold a new project interactively
    python build.py deploy    print deployment instructions

Everything reads js/content.js — the single source of truth.
"""
import re, sys, json, pathlib, http.server, socketserver, functools, webbrowser

ROOT = pathlib.Path(__file__).parent
CONTENT = ROOT / "js" / "content.js"
G, R, Y, B, X = "\033[92m", "\033[91m", "\033[93m", "\033[94m", "\033[0m"
ok = lambda m: print(f"  {G}OK{X}   {m}")
warn = lambda m: print(f"  {Y}WARN{X} {m}")
bad = lambda m: print(f"  {R}FAIL{X} {m}")


def read():
    return CONTENT.read_text(encoding="utf-8")


def field(src, key):
    m = re.search(rf"{key}\s*:\s*'([^']*)'", src)
    return m.group(1) if m else ""


def ids(src):
    return re.findall(r"^\s*id:\s*'([^']+)'", src, re.M)


# ─────────────────────────────────────────── check
def cmd_check():
    src = read()
    print(f"\n{B}Pre-flight check{X}\n")
    fails = warns = 0

    print("Contact details")
    for k, placeholder in [("email", "you@example.com"),
                           ("github", "yourname"),
                           ("linkedin", "yourname")]:
        v = field(src, k)
        if not v:
            bad(f"{k} is empty"); fails += 1
        elif placeholder in v:
            bad(f"{k} still a placeholder: {v}"); fails += 1
        else:
            ok(f"{k} = {v}")

    print("\nRésumé")
    if not field(src, "resume"):
        warn("no résumé set — recruiters look for this first"); warns += 1
    else:
        f = ROOT / field(src, "resume")
        (ok if f.exists() else bad)(f"résumé {'found' if f.exists() else 'MISSING: ' + str(f)}")
        fails += 0 if f.exists() else 1

    print("\nProjects")
    pids = ids(src)
    ok(f"{len(pids)} projects: {', '.join(pids)}")
    for pid in pids:
        blk = src.split(f"id:'{pid}'")[1][:6000] if f"id:'{pid}'" in src else ""
        if "study:[" not in blk:
            warn(f"{pid} has no case study"); warns += 1
    repos = len(re.findall(r"repo:\s*'https", src))
    if repos == 0:
        warn("no GitHub repo links on any project — 'show me the code' is the #1 recruiter ask"); warns += 1
    else:
        ok(f"{repos} repo link(s)")
    photos = len(re.findall(r"photo:\s*'", src))
    if photos == 0:
        warn("no real photos — a lit PCB shot is the biggest visual upgrade available"); warns += 1
    else:
        ok(f"{photos} photo(s)")

    print("\nFiles")
    for f in ["index.html", "project.html", "css/main.css",
              "js/content.js", "js/main.js", "js/study.js", "js/scope.js"]:
        pth = ROOT / f
        (ok if pth.exists() else bad)(f)
        fails += 0 if pth.exists() else 1
    for f in ["og.png", "sitemap.xml", "robots.txt"]:
        if not (ROOT / f).exists():
            warn(f"{f} missing" + ("  (run: python build.py seo)" if f != "og.png" else "  (social preview image)"))
            warns += 1

    print(f"\n{'─'*46}")
    if fails:
        print(f"{R}{fails} blocking issue(s){X}, {warns} warning(s)\n"); return 1
    print(f"{G}No blockers.{X} {warns} warning(s).\n"); return 0


# ─────────────────────────────────────────── seo
def cmd_seo():
    src = read()
    url = field(src, "url").rstrip("/")
    pages = ["", "#work", "#about", "#contact"]
    body = "".join(
        f"  <url><loc>{url}/</loc><priority>1.0</priority></url>\n" if p == "" else ""
        for p in pages[:1])
    for pid in ids(src):
        body += f"  <url><loc>{url}/project.html?p={pid}</loc><priority>0.8</priority></url>\n"
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'{body}</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {url}/sitemap.xml\n", encoding="utf-8")
    ok("sitemap.xml + robots.txt written")
    return 0


# ─────────────────────────────────────────── new project
TEMPLATE = """,
{{
  id:'{id}',
  n:'{n}',
  title:'{title}',
  short:'{title}',
  status:'In progress', live:true,
  label:'{label} / REV A',
  year:'{year}',
  role:'TODO — what you owned',

  problem:'TODO — what was broken or missing. Be concrete.',
  approach:'TODO — what you built and the key decision you made.',
  result:'TODO — the outcome, ideally with a <b>number</b>.',
  metric:{{ value:'00', unit:'units', label:'What it measures' }},

  body:`TODO — two sentences for the scroll section.`,

  specs:[['Key','Value'],['Key','Value'],['Key','Value'],['Key','Value']],
  tags:['Tag','Tag','Tag'],
  stack:['Tool','Tool'],
  photo:null,      // 'img/{id}.jpg'
  repo:null,       // 'https://github.com/you/repo'

  study:[
    {{ h:'Why this exists', p:`TODO — the honest origin. What annoyed you?` }},
    {{ h:'The key decision', p:`TODO — the fork in the road and why you chose your path.`,
      code:`// optional code sample` }},
    {{ h:'What went wrong', p:`TODO — the failure you did not expect. This is the most
       interesting section to a recruiter, do not skip it.` }},
    {{ h:'What I would do differently', p:`TODO — shows self-assessment.` }}
  ],

  viz:`<svg viewBox="0 0 400 300" fill="none">
    <g stroke="#00E5FF" stroke-width="1.5">
      <rect class="draw" x="60" y="110" width="90" height="70" rx="3"/>
      <path class="draw" d="M150 145h80"/>
      <circle class="draw" cx="260" cy="145" r="26"/>
    </g>
  </svg>`
}}"""


def cmd_new():
    src = read()
    print(f"\n{B}New project{X}\n")
    title = input("  Title: ").strip()
    if not title:
        bad("cancelled"); return 1
    pid = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    year = input("  Year [2026]: ").strip() or "2026"
    label = re.sub(r"[^A-Z]", "", title.upper())[:8] or "PROJECT"
    n = f"{len(ids(src)) + 1:02d}"

    block = TEMPLATE.format(id=pid, n=n, title=title, year=year, label=label)
    marker = "\n];\n\nconst SKILLS"
    if marker not in src:
        bad("could not find the insertion point in content.js"); return 1
    CONTENT.write_text(src.replace(marker, block + marker), encoding="utf-8")
    ok(f"added '{title}' as {pid}")
    print(f"\n  Now edit {B}js/content.js{X} and fill in the TODOs.")
    print(f"  Preview: {B}python build.py serve{X}  →  project.html?p={pid}\n")
    return 0


# ─────────────────────────────────────────── serve
def cmd_serve():
    port = 8823
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), h) as srv:
        print(f"\n  {G}Serving{X} http://localhost:{port}\n  Ctrl-C to stop\n")
        try:
            webbrowser.open(f"http://localhost:{port}")
        except Exception:
            pass
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\n  stopped\n")
    return 0


# ─────────────────────────────────────────── deploy
def cmd_deploy():
    print(f"""
{B}Deploying{X}

{B}Option 1 — Cloudflare Pages{X} (recommended: fastest CDN, free, custom domain)
  1. Push this folder to a GitHub repo
  2. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
  3. Build command: (leave empty)   Output directory: /
  4. Add your custom domain under the Custom domains tab

{B}Option 2 — GitHub Pages{X} (zero extra accounts)
  git init && git add -A && git commit -m "portfolio"
  git branch -M main
  git remote add origin https://github.com/USER/USER.github.io.git
  git push -u origin main
  → live at https://USER.github.io

{B}Option 3 — Netlify drop{X} (fastest, no git)
  app.netlify.com/drop  → drag this folder in

{Y}Before you deploy:{X}
  python build.py check      ← fix blockers first
  python build.py seo        ← regenerate sitemap

{Y}A custom domain is worth the ~$12/yr.{X} anmolbhandohal.com reads far better
on a résumé than a github.io subdomain, and you can use it for email too.
""")
    return 0


CMDS = {"check": cmd_check, "seo": cmd_seo, "serve": cmd_serve,
        "new": cmd_new, "deploy": cmd_deploy}

if __name__ == "__main__":
    c = sys.argv[1] if len(sys.argv) > 1 else "check"
    if c not in CMDS:
        print(__doc__); sys.exit(1)
    sys.exit(CMDS[c]())

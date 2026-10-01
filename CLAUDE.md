# akta-social — rules for every session

- Daily posts follow [ROUTINE.md](ROUTINE.md); content follows `content/GUIDE.md` and `content/FACTS.md`.
- Posts are committed to `claude/posts`; templates and rules live on `main`.
- Commits are authored as `Yaraslau Lahinouski <loginovskiy8@gmail.com>`. Commit messages are
  English and carry no tool attribution: no `Co-Authored-By`, no `Claude-Session`, no
  "Generated with" line.
- Never publish, schedule or send for review in Metricool. A draft (`"draft": true`) is the only
  thing a session may create there; the owner's scheduling click is the approval.
- Nothing from the Akta CRM product database or any client file ever goes into this repository.

## Where to change what

| Change | Where |
|---|---|
| Look of the slides: colours, fonts, sizes, layouts, new slide types | `render/render.mjs` (the `CSS` block and `slideHtml`) |
| Rubrics per weekday, tone, hashtags, hard bans, CTA wording | `content/GUIDE.md` |
| What the posts may claim about the product | `content/FACTS.md` |
| Product screens and their crops | `assets/screens/` + `SCREENS` in `render/render.mjs` |
| What the evening run does step by step | `ROUTINE.md` |
| The weekly performance report (Sundays) and what it may change | `ANALYTICS.md`; output in `analytics/` on `claude/posts` |
| Schedule, model, connectors of the evening run | the Claude routine `trig_01DPNvh5mxouAPgHN53gaQhf` (`/schedule` or claude.ai/code/routines) |

Every change goes to `main`; the evening run merges `main` into `claude/posts` before it writes.
Before pushing a visual change, render an existing post (`node render/render.mjs posts/<date>`)
and look at `preview.png`; the reference style is the owner's August 2026 carousels.

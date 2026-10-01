# akta-social

Instagram and Facebook carousels for Akta CRM.

This repository is public on purpose: Metricool fetches each slide by its raw GitHub URL
when it schedules a post. It holds only marketing material that becomes public on
Instagram anyway. Nothing from the CRM, its database, or any client file ever goes here;
the only product images are three screens of the demo workspace in `assets/screens/`.

## How a post is made

Every weekday evening a scheduled Claude routine follows [ROUTINE.md](ROUTINE.md):
it writes `posts/<date>/post.json` under the rules in [content/GUIDE.md](content/GUIDE.md)
and [content/FACTS.md](content/FACTS.md), renders the slides, commits them to the
`claude/posts` branch, and creates a **draft** in Metricool for 08:00 the next morning.
Nothing is published until the owner opens the draft and schedules it.

## Rendering locally

```bash
npm ci
node render/render.mjs posts/2026-10-02
```

`main` holds the templates and the rules; `claude/posts` holds the published posts.

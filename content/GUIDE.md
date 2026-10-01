# Editorial guide — Akta CRM on Instagram and Facebook

Public copy is Polish. This guide is English so the rules are unambiguous.

## Reader

The owner or a lawyer of a small Polish immigration law firm (`kancelaria imigracyjna`,
often one to seven people), and on Fridays the employer or HR lead who legalises foreign
workers through such a firm. Professionally sceptical, reads carefully, distrusts claims
without proof.

Foreigners asking "how do I get a residence card" are **not** the reader. Never write for them.

## Weekly rubric

One carousel per weekday, published at 08:00 Europe/Warsaw. The weekday decides the rubric.

| Day | Rubric | Pillar | Shape |
|---|---|---|---|
| Mon | **Problem w kancelarii** — one concrete pain from daily office work (status calls, the inbox, a missed `wezwanie`, a colleague on leave) and how a single case file removes it | A | 4–5 slides, teal, `cover` → `statement` ×2–3 → `cta` |
| Tue | **Funkcja w praktyce** — one product mechanism shown on a real screen | A | 4–5 slides: `cover` → `screen` → `list` or `statement` → `cta` |
| Wed | **Porządek w aktach** — how the office organises a stage of work: intake, collecting documents, a `wezwanie`, filing, handover | B | 4–6 slides, paper: `cover` → `list` ×1–2 → `statement` → `cta` |
| Thu | **Mit czy fakt?** — a misconception about switching systems, data protection, AI or leaving a vendor, answered with a checkable fact | D | 4–5 slides, paper: `cover` (eyebrow `Mit czy fakt?`) → `tag` (`Mit`/`Fakt`) ×2–3 → `cta` |
| Fri | **Pracodawca i kancelaria** — what a company prepares before it goes to a firm, and how the two work on one file | C | 4–5 slides, mint or paper: `cover` → `list` → `statement` → `cta` (CTA: show this to your firm / book a presentation, never "register") |

Vary the angle within a rubric week to week. Never reuse a cover title or a `topic` that
appears in `posts/` in the last 60 days.

## Hard bans

Do not publish, ever:

- Guides for applicants: «jak uzyskać kartę pobytu», «ile czeka się na decyzję», «jak wypełnić wniosek».
- Legal news («ustawa weszła w życie», «od 1 stycznia…») — a lawyer must sign those off, and this pipeline has no lawyer.
- Statutory specifics: deadlines in days, fees, article numbers, office waiting times, lists of documents "required by law".
  Talk about how the office **organises** the work, not what the statute requires.
- Customers, logos, testimonials, case studies, usage numbers, benchmarks, or soft forms of them
  («setki kancelarii», «zaufały nam», «coraz więcej firm»). None exist that may be named.
- Urgency or scarcity («tylko dziś», «ostatnie miejsca»), promises of outcomes or office deadlines,
  «złożymy wniosek za Ciebie».
- Competitors by name, prices, discounts.
- Any product claim not in [FACTS.md](FACTS.md).
- Real people's data. Screens come only from `assets/screens/` (demo workspace).
- Generated photos or illustrations. The design is typographic; the only images are the three demo screens.

Any slide that touches a proceeding or an employer duty adds this line to the caption:
`Materiał informacyjny dla kancelarii i pracodawców, nie porada prawna.`

## Voice

Precise, calm, the language of the file: `sprawa`, `wezwanie`, `akta`, `etap`, `termin`,
`pracodawca`, `umowa powierzenia`. Do not explain to a lawyer what a missed deadline means.
No corporate filler, no exclamation marks, at most one emoji per caption and usually none.
Address the reader as `Ty`/`Twoja kancelaria`, as the existing posts do.

## Slides

- 1080×1350, rendered by `render/render.mjs` from `posts/<date>/post.json`.
- Cover: a question or a sharp statement, at most ~12 words. It is the hook; it must work alone in the feed.
- One idea per slide. Title at most ~16 words; `sub` at most ~20 words.
- `list` slides: 3–5 items, each at most ~6 words.
- `*word*` highlights one word or phrase in coral. Use it at most once per slide, and not on every slide.
- `\n` forces a line break; use it to separate two sentences on one slide, as the August posts do.
- The last slide is always `cta`: `Sprawdź,\njak to działa.` + `Link do testów w bio.` for firms;
  for Friday, e.g. `Pokaż to\nswojej kancelarii.` + `Prezentację umówisz na aktacrm.com.`
- Teal and paper alternate well; keep one theme per post unless a `tag`/`statement` slide needs contrast.

## Caption

- First line repeats the hook in other words (it is what shows before "więcej").
- 3–6 short lines that add what the slides do not say. Total at most ~900 characters.
- A CTA line: `Link do bezpłatnych testów w bio.` (firms) or `Prezentację umówisz na aktacrm.com.` (employers).
- The disclaimer line when required (see above).
- 3–5 hashtags at the end, from: `#kancelaria #kancelariaprawna #prawoimigracyjne #kancelariaimigracyjna #legalizacjapobytu #legalizacjazatrudnienia #zatrudnianiecudzoziemców #hr #aktacrm`.
  Always `#aktacrm`. Never hashtags aimed at applicants.

## post.json

```json
{
  "date": "2026-10-05",
  "rubric": "Mon — Problem w kancelarii",
  "pillar": "A",
  "topic": "status-calls-from-clients",
  "caption": "…",
  "slides": [
    { "type": "cover", "theme": "teal", "title": "…" },
    { "type": "statement", "theme": "teal", "title": "…", "sub": "…" },
    { "type": "screen", "theme": "paper", "eyebrow": "W Akta CRM", "title": "…", "image": "assets/screens/sprawa-etapy.png#etapy" },
    { "type": "list", "theme": "paper", "eyebrow": "…", "title": "…", "items": ["…", "…", "…"] },
    { "type": "tag", "theme": "paper", "tag": "Fakt", "title": "…", "sub": "…" },
    { "type": "cta", "theme": "teal", "title": "Sprawdź,\njak to działa.", "sub": "Link do testów w bio." }
  ]
}
```

Fields per slide: `type` (`cover|statement|tag|list|screen|cta`), `theme` (`teal|paper|mint`),
`title` (required), optional `eyebrow`, `tag`, `sub`, `items`, `image` (screen only), `hint`
(small footer line, e.g. `Przesuń →` on a cover), `pill` (cta only, default `aktacrm.com`).

Screens (demo workspace only). A screen slide shows one named crop, `"image": "<file>#<crop>"`:

| `image` | What it shows |
|---|---|
| `assets/screens/sprawa-etapy.png#etapy` | current stage "Dokumenty", stage 3 of 10, the stage stepper |
| `assets/screens/sprawa-etapy.png#kroki` | the checklist of steps for the current stage |
| `assets/screens/dashboard.png#wezwania` | dashboard: active `wezwania` and the nearest deadlines |
| `assets/screens/dashboard-analityka.png#lejek` | case funnel: active cases by stage |
| `assets/screens/dashboard-analityka.png#terminy` | deadline load: cases, `wezwania` and tasks over the next 14 days |
| `assets/screens/dashboard-analityka.png#dokumenty` | document status across all case checklists |
| `assets/screens/dashboard-analityka.png#moja-praca` | "Moja praca": my cases, tasks and `wezwania` |

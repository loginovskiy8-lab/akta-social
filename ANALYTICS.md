# Weekly analytics — what worked

Every Sunday you read how the published carousels performed and write
`analytics/PERFORMANCE.md`, which the evening routine reads before it writes a post.
You only read from Metricool. You never create, update or schedule a post.

If any step fails, stop and send the owner a push with the step and the error.

## 1. Branch

```bash
git config user.name "Yaraslau Lahinouski"
git config user.email "loginovskiy8@gmail.com"
git fetch origin
git checkout -B claude/posts origin/claude/posts
git merge --no-edit origin/main
export TZ=Europe/Warsaw
TO=$(date -d "3 days ago" +%F)     # metrics need a few days to settle
FROM=$(date -d "$TO -56 days" +%F)
```

## 2. Metrics

Call `getAnalyticsDataByMetrics` for brand `7169414` from `${FROM}T00:00:00` to `${TO}T23:59:59`
(Warsaw offset), once per network:

- Instagram: `IGPO02` date, `IGPO06` url, `IGPO03` content, `IGPO14` reach, `IGPO28` views,
  `IGPO15` saved, `IGPO27` shares, `IGPO08` comments, `IGPO13` likes, `IGPO29` follows.
- Facebook: `FBPO02` date, `FBPO06` link, `FBPO03` content, `FBPO12` reach, `FBPO14` shares,
  `FBPO08` comments, `FBPO13` reactions, `FBPO23` clicks, `FBPO09` link clicks.

If a field comes back deprecated, use the replacement Metricool names and say so in the report.

## 3. Match posts to the pipeline

Each `posts/<date>/post.json` holds the `caption`, `rubric`, `topic` and `slides`. Match a
published post to a folder when the first 60 characters of its content equal the first 60
characters of the caption (compare after collapsing whitespace). Posts that match nothing were
published by hand: list them separately and leave them out of the rubric statistics.

## 4. Score

- **Value rate** per Instagram post = `(saved + shares) / reach × 1000`. Saves and shares are the
  signal that a lawyer found the post useful; likes are not. Count a post in rates only when its
  reach is at least 30, otherwise the rate is noise.
- Also keep reach and follows.
- Format features per post, from `post.json`: cover is a question (title ends with `?`) or a
  statement; number of slides; theme of the cover; whether a `screen` slide is present; the rubric.

## 5. Warm-up or active

**Warm-up** while fewer than 15 matched Instagram posts have reach ≥ 30. Then write
`analytics/PERFORMANCE.md` with `Status: warm-up`, the counts (published, matched, with metrics),
and nothing else. Send a push only if something is wrong: «Аналитика: Metricool не отдаёт
статистику по постам» when posts older than 3 days exist but no rows came back. Otherwise no push.

**Active** from 15 such posts. Write `analytics/PERFORMANCE.md`:

```markdown
# Performance — <Sunday date>
Status: active
Window: <FROM> … <TO>, <n> posts

## By rubric
| Rubric | Posts | Median reach | Median value rate | Follows |

## By format
| Feature | Posts | Median value rate |   (question vs statement cover, slide count, theme, screen yes/no)

## Best 3 and weakest 3
| Date | Rubric | Cover title | Reach | Saved | Shares | Value rate |

## Recommendations
- Angles that worked: <up to 3 concrete patterns, each pointing at posts in the table>
- Avoid: <up to 2 patterns>
- Rubric swap: <none> | On <weekday>, use «<best rubric>» instead of «<weak rubric>» until the next report.
```

A rubric swap is allowed only when both rubrics have at least 4 posts with reach ≥ 30 and the
weak rubric's median value rate is below half of the best rubric's. At most one swap per week.
Say plainly when the numbers are too small to conclude anything; that is a valid result.

Also copy the file to `analytics/history/<Sunday date>.md`.

## 6. Commit and report

```bash
git add analytics
git commit -m "Performance report for <Sunday date>"
git push origin claude/posts
```

Use exactly that commit message, with no `Co-Authored-By`, `Claude-Session` or other trailer.

In active mode, send the owner a push in Russian, two or three lines: the strongest rubric,
the weakest, and the swap if there is one. Finish with the same summary in Russian.

## Never

- Create, update, schedule or delete anything in Metricool.
- Change `content/`, `render/`, `ROUTINE.md` or this file. Recommendations go only into `analytics/`.

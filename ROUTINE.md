# Evening routine — tomorrow's carousel

You prepare tomorrow's Instagram + Facebook carousel for Akta CRM and leave it in Metricool
as a **draft**. You never publish and never schedule. The owner opens the draft, checks it
and schedules it by hand; that click is the approval.

Work through the steps in order. If any step fails, stop, do not create anything in
Metricool, and report what failed with the exact error.

## 1. Target date

If the prompt that started you gives `TARGET_DATE=YYYY-MM-DD`, run `export TARGET_DATE=<that date>` first.

```bash
export TZ=Europe/Warsaw
DATE=${TARGET_DATE:-$(date -d tomorrow +%F)}
DOW=$(date -d "$DATE" +%u)            # 1 = Monday … 7 = Sunday
if [ "$DOW" -ge 6 ]; then DATE=$(date -d "$DATE +$((8 - DOW)) days" +%F); DOW=1; fi
# +02:00 in summer, +01:00 in winter; Node's ICU knows the zone even if the OS lacks tzdata
OFFSET=$(node -e 'const s=new Date(process.argv[1]+"T08:00:00Z").toLocaleString("en-US",{timeZone:"Europe/Warsaw",timeZoneName:"longOffset"});const m=s.match(/GMT([+-]\d\d:\d\d)/);console.log(m?m[1]:"")' "$DATE")
echo "$DATE $DOW $OFFSET"
```

`OFFSET` must be `+01:00` or `+02:00`; anything else is a failure. The weekday `DOW` picks
the rubric in `content/GUIDE.md`.

## 2. Branch

Posts live on the branch `claude/posts`; `main` holds the templates and rules.

```bash
git fetch origin
if git ls-remote --exit-code --heads origin claude/posts >/dev/null; then
  git checkout -B claude/posts origin/claude/posts
  git merge --no-edit origin/main
else
  git checkout -B claude/posts origin/main
fi
npm ci
```

## 3. Do not make a second post for the same day

Call Metricool `getScheduledPosts` with `brandId` `7169414`, timezone `Europe/Warsaw`,
from `${DATE}T00:00:00${OFFSET}` to `${DATE}T23:59:59${OFFSET}`. If any post or draft for
Instagram already exists that day, stop and report it. Also stop if `posts/$DATE/` already exists.

## 4. Read the rules and the history

- Read `content/GUIDE.md` and `content/FACTS.md` in full. They are binding.
- List what was already published so you do not repeat it:
  `for f in posts/*/post.json; do node -e "const p=require('./'+process.argv[1]);console.log(p.date,'|',p.rubric,'|',p.topic,'|',p.slides[0].title)" "$f"; done`
  Do not reuse a `topic` or a cover title from the last 60 days, and choose an angle the
  same rubric has not used recently.

## 5. Write the post

Create `posts/$DATE/post.json` (format in `content/GUIDE.md`) with `date`, `rubric`, `pillar`,
`topic` (short kebab-case), `caption`, `slides`, and `claims`: every product claim the post
makes, each copied word for word from a line of `content/FACTS.md`.

Before rendering, check the text against the hard bans in `content/GUIDE.md` line by line:
no applicant guides, no legal news, no statutory deadlines/fees/article numbers/document lists,
no customers or numbers, no urgency, no competitors or prices, no claim missing from `claims`.
Add the disclaimer line to the caption when the post touches a proceeding or an employer duty.

## 6. Render and look

```bash
node render/render.mjs "posts/$DATE"
```

Exit code 2 means text overflowed: shorten it and render again. Then open
`posts/$DATE/preview.png` and **every** `slide-NN.jpg` with the Read tool and check:
nothing cut off or overlapping, no title ending in a single orphaned word, Polish characters
correct, at most one coral highlight per slide, the screen crop matches what the slide says.
Fix and re-render until all of that holds.

## 7. Commit and push

Commit only the new folder:

```bash
git add "posts/$DATE"
git commit -m "Post for $DATE: <topic>"
git push origin claude/posts
SHA=$(git rev-parse HEAD)
```

Then check every slide is reachable (retry for up to a minute):

```bash
for f in posts/$DATE/slide-*.jpg; do
  curl -sfI "https://raw.githubusercontent.com/loginovskiy8-lab/akta-social/$SHA/$f" | head -1
done
```

## 8. Draft in Metricool

Call `createScheduledPost` with `blogId` `"7169414"`, `date` `"${DATE}T08:00:00${OFFSET}"` and `info`:

```json
{
  "autoPublish": true,
  "draft": true,
  "descendants": [],
  "firstCommentText": "",
  "hasNotReadNotes": false,
  "media": ["https://raw.githubusercontent.com/loginovskiy8-lab/akta-social/<SHA>/posts/<DATE>/slide-01.jpg", "…"],
  "mediaAltText": ["<slide 1 title, plain text>", "…"],
  "providers": [{ "network": "instagram" }, { "network": "facebook" }],
  "publicationDate": { "dateTime": "<DATE>T08:00:00", "timezone": "Europe/Warsaw" },
  "shortener": false,
  "smartLinkData": { "ids": [] },
  "text": "<caption>",
  "instagramData": { "type": "POST" },
  "facebookData": { "type": "POST" }
}
```

`"draft": true` is mandatory. Never send `"draft": false`, never call
`createScheduledPostForReview`, and never update or touch a Metricool post you did not create in this run.

## 9. Report

Finish with a short summary **in Russian** for the owner: the date and weekday, the rubric,
the cover title, the `plannerUrl` from Metricool, and the commit SHA. If you stopped early,
say at which step and why.

## Never

- Change anything outside `posts/$DATE/`. If a template or rule looks wrong, say so in the report.
- Use any image other than the slides rendered from `assets/screens/` crops and text.
- Publish, schedule, or send for review.

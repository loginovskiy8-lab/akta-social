// Renders one post folder: posts/<date>/post.json -> slide-01.jpg ... + preview.png
// Slides are JPEG because the Instagram publishing API accepts only JPEG images.
// Usage: node render/render.mjs posts/2026-10-05
//
// Exit code 2 means a slide still overflows after shrinking the title: shorten the text.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1080;
const H = 1350;

const SLIDE_TYPES = new Set(["cover", "statement", "tag", "list", "screen", "cta"]);
const THEMES = new Set(["teal", "paper", "mint"]);
// Demo-workspace screens only. A full screen shrunk to 940px is unreadable on a phone,
// so a screen slide shows a named crop: "assets/screens/<file>#<crop>". [x, y, w, h] in source px.
const SCREENS = {
  "assets/screens/sprawa-etapy.png": {
    width: 1761,
    crops: { etapy: [305, 308, 560, 235], kroki: [335, 555, 600, 365] },
  },
  "assets/screens/dashboard.png": {
    width: 2024,
    crops: { wezwania: [365, 745, 620, 470] },
  },
  "assets/screens/dashboard-analityka.png": {
    width: 2024,
    crops: {
      lejek: [365, 495, 765, 330],
      terminy: [1135, 495, 765, 375],
      dokumenty: [365, 875, 765, 295],
      "moja-praca": [1135, 875, 765, 380],
    },
  },
};
const FRAME_W = W - 70; // the frame runs off the right edge of the slide

function screenOf(ref) {
  const [file, crop] = String(ref || "").split("#");
  const screen = SCREENS[file];
  const box = screen?.crops[crop];
  return screen && box ? { file, width: screen.width, box } : null;
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// *word* -> highlighted, newline -> forced break
const rich = (s) =>
  esc(s)
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

const CHECK = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12.5 20.5l5 5 10-11" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const fontCss = [400, 500, 700, 800]
  .map((w) => `<link rel="stylesheet" href="${pathToFileURL(path.join(ROOT, `node_modules/@fontsource/inter/${w}.css`)).href}">`)
  .join("\n");

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; }
body { font-family: "Inter", sans-serif; -webkit-font-smoothing: antialiased; font-feature-settings: "cv11", "ss01" 0; }
.slide { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
.teal  { background: #0E6E63; color: #FFFFFF; }
.paper { background: #FAF9F6; color: #1B2129; }
.mint  { background: linear-gradient(160deg, #F2F8F6 0%, #E6F1EE 100%); color: #1B2129; }

.brand { position: absolute; top: 78px; left: 70px; }
.brand .word { font-weight: 800; font-size: 44px; line-height: 1; letter-spacing: 0.005em; }
.brand .bar { width: 108px; height: 9px; border-radius: 5px; background: #EB6857; margin-top: 30px; }
.paper .brand .bar, .mint .brand .bar { background: #0E5A4D; width: 92px; height: 8px; }
.counter { position: absolute; top: 88px; right: 70px; font-size: 24px; font-weight: 500; color: rgba(255,255,255,0.72); }
.paper .counter, .mint .counter { color: #8A8F98; }

.body { position: absolute; left: 70px; right: 70px; top: 230px; bottom: 230px;
        display: flex; flex-direction: column; justify-content: center; }
.eyebrow { font-size: 24px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
           color: #0E5A4D; margin-bottom: 34px; }
.teal .eyebrow { color: #B5D5D0; }
.tag { align-self: flex-start; border: 2px solid #0E5A4D; border-radius: 999px; padding: 8px 22px 9px;
       font-size: 24px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
       color: #0E5A4D; margin-bottom: 36px; }
.teal .tag { border-color: #B5D5D0; color: #FFFFFF; }
.title { font-weight: 800; font-size: 66px; line-height: 1.1; letter-spacing: -0.015em;
         max-width: 760px; text-wrap: balance; }
.title em { font-style: normal; color: #EB6857; }
.teal .title em { color: #FFA092; }
.sub { font-size: 32px; line-height: 1.38; color: #B5D5D0; margin-top: 120px; max-width: 760px; text-wrap: pretty; }
.paper .sub, .mint .sub { color: #5D646E; }

.items { list-style: none; margin-top: 56px; display: flex; flex-direction: column; gap: 28px; }
.items li { display: flex; gap: 22px; align-items: flex-start; font-size: 34px; line-height: 1.3; font-weight: 500; }
.items svg { flex: none; width: 40px; height: 40px; margin-top: 1px; color: #0E6E63; }
.teal .items svg { color: #B5D5D0; }

.shot { margin-top: 52px; border-radius: 18px; overflow: hidden; border: 1px solid #E3E1DA;
        box-shadow: 0 24px 60px rgba(14, 90, 77, 0.16); background: #FFFFFF; }
.shot img { display: block; max-width: none; }

.hint { position: absolute; left: 70px; bottom: 112px; font-size: 26px; color: #8A8F98; }
.teal .hint { color: rgba(255,255,255,0.72); }
.pill { position: absolute; left: 70px; bottom: 126px; height: 74px; padding: 0 52px; border-radius: 37px;
        display: flex; align-items: center; font-size: 32px; font-weight: 700; background: #FFFFFF; color: #0E6E63; }
.paper .pill, .mint .pill { background: #0E5A4D; color: #FFFFFF; }

.t-cover .title { font-size: 72px; max-width: 800px; }
.t-tag .title { font-size: 56px; font-weight: 700; line-height: 1.16; max-width: 760px; }
.t-list .title { font-size: 58px; }
.t-screen .body { right: 0; top: 200px; bottom: 150px; }
.t-screen .eyebrow, .t-screen .title, .t-screen .sub { margin-right: 70px; }
.t-screen .shot { border-right: 0; border-radius: 18px 0 0 18px; }
.t-screen .title { font-size: 50px; line-height: 1.14; }
.t-cta .title { font-size: 84px; line-height: 1.05; max-width: 940px; }
.t-cta .sub { margin-top: 56px; }
.t-tag .sub, .t-list .sub, .t-screen .sub { margin-top: 40px; }
.t-list .title, .t-screen .title { max-width: 900px; }
`;

function slideHtml(slide, index, total) {
  const t = slide.type;
  const parts = [];
  if (slide.eyebrow) parts.push(`<div class="eyebrow">${esc(slide.eyebrow)}</div>`);
  if (slide.tag) parts.push(`<div class="tag">${esc(slide.tag)}</div>`);
  if (slide.title) parts.push(`<h1 class="title">${rich(slide.title)}</h1>`);
  if (slide.sub) parts.push(`<p class="sub">${rich(slide.sub)}</p>`);
  if (Array.isArray(slide.items) && slide.items.length) {
    parts.push(`<ul class="items">${slide.items.map((i) => `<li>${CHECK}<span>${rich(i)}</span></li>`).join("")}</ul>`);
  }
  if (slide.image) {
    const { file, width, box } = screenOf(slide.image);
    const [x, y, w, h] = box;
    const s = FRAME_W / w;
    const src = pathToFileURL(path.join(ROOT, file)).href;
    parts.push(
      `<div class="shot" style="height:${Math.round(h * s)}px"><img src="${src}" alt="" ` +
        `style="width:${Math.round(width * s)}px;transform:translate(${Math.round(-x * s)}px,${Math.round(-y * s)}px)"></div>`,
    );
  }
  const showCounter = total > 1 && slide.counter !== false;
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8">${fontCss}<style>${CSS}</style></head>
<body><div class="slide ${slide.theme} t-${t}">
  <div class="brand"><div class="word">AKTA</div><div class="bar"></div></div>
  ${showCounter ? `<div class="counter">${index + 1}/${total}</div>` : ""}
  <div class="body">${parts.join("\n")}</div>
  ${slide.hint ? `<div class="hint">${esc(slide.hint)}</div>` : ""}
  ${t === "cta" ? `<div class="pill">${esc(slide.pill || "aktacrm.com")}</div>` : ""}
</div></body></html>`;
}

function validate(post) {
  const errors = [];
  if (!Array.isArray(post.slides) || post.slides.length < 2 || post.slides.length > 10) {
    errors.push("slides: an Instagram carousel needs 2 to 10 slides");
  }
  (post.slides || []).forEach((s, i) => {
    const at = `slides[${i}]`;
    if (!SLIDE_TYPES.has(s.type)) errors.push(`${at}.type must be one of ${[...SLIDE_TYPES].join(", ")}`);
    if (!THEMES.has(s.theme)) errors.push(`${at}.theme must be one of ${[...THEMES].join(", ")}`);
    if (!s.title) errors.push(`${at}.title is required`);
    if (s.type === "screen" && !screenOf(s.image)) {
      const all = Object.entries(SCREENS).flatMap(([f, v]) => Object.keys(v.crops).map((c) => `${f}#${c}`));
      errors.push(`${at}.image must be one of ${all.join(", ")}`);
    }
    if (s.type !== "screen" && s.image) errors.push(`${at}.image is only allowed on a screen slide`);
    if (s.type === "list" && !(Array.isArray(s.items) && s.items.length >= 2 && s.items.length <= 6)) {
      errors.push(`${at}.items: a list slide needs 2 to 6 items`);
    }
  });
  if (!post.caption || post.caption.length > 2200) errors.push("caption is required and must be at most 2200 characters");
  return errors;
}

// Shrinks the title until the body fits; reports what still does not.
async function fit(page) {
  return page.evaluate(() => {
    const body = document.querySelector(".body");
    const title = document.querySelector(".title");
    const overflows = () =>
      body.scrollHeight > body.clientHeight + 1 ||
      [...body.querySelectorAll(".title, .sub, .items li")].some((el) => el.scrollWidth > el.clientWidth + 1);
    let size = parseFloat(getComputedStyle(title).fontSize);
    const start = size;
    const min = Math.round(start * 0.72);
    while (overflows() && size > min) {
      size -= 2;
      title.style.fontSize = `${size}px`;
    }
    return { start, size, overflow: overflows() };
  });
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node render/render.mjs posts/<date>");
    process.exit(1);
  }
  const postDir = path.resolve(ROOT, dir);
  const post = JSON.parse(await fs.readFile(path.join(postDir, "post.json"), "utf8"));
  const errors = validate(post);
  if (errors.length) {
    console.error("post.json is invalid:\n- " + errors.join("\n- "));
    process.exit(1);
  }

  for (const f of await fs.readdir(postDir)) {
    if (/^slide-\d+\.(png|jpg)$/.test(f) || f === "preview.png") await fs.unlink(path.join(postDir, f));
  }

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--font-render-hinting=none"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const tmp = path.join(postDir, ".render.tmp.html");
  const files = [];
  let failed = false;

  for (const [i, slide] of post.slides.entries()) {
    await fs.writeFile(tmp, slideHtml(slide, i, post.slides.length), "utf8");
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const r = await fit(page);
    const name = `slide-${String(i + 1).padStart(2, "0")}.jpg`;
    await page.screenshot({ path: path.join(postDir, name), type: "jpeg", quality: 92 });
    files.push(name);
    const note = r.size < r.start ? ` (title ${r.start}px -> ${r.size}px)` : "";
    if (r.overflow) {
      failed = true;
      console.error(`OVERFLOW ${name}: text does not fit even at ${r.size}px - shorten it`);
    } else {
      console.log(`ok ${name}${note}`);
    }
  }

  // Contact sheet for a quick look at the whole carousel.
  const scale = 0.3;
  const cols = Math.min(files.length, 5);
  const rows = Math.ceil(files.length / cols);
  const gap = 16;
  const pw = cols * W * scale + (cols + 1) * gap;
  const ph = rows * H * scale + (rows + 1) * gap;
  const imgs = files
    .map((f) => `<img src="${pathToFileURL(path.join(postDir, f)).href}" style="width:${W * scale}px;height:${H * scale}px;display:block">`)
    .join("");
  await fs.writeFile(
    tmp,
    `<!doctype html><html><body style="margin:0;background:#D9D7D0;width:${pw}px;height:${ph}px">
     <div style="display:grid;grid-template-columns:repeat(${cols},${W * scale}px);gap:${gap}px;padding:${gap}px">${imgs}</div></body></html>`,
    "utf8",
  );
  await page.setViewport({ width: Math.ceil(pw), height: Math.ceil(ph), deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.screenshot({ path: path.join(postDir, "preview.png"), type: "png" });

  await fs.unlink(tmp);
  await browser.close();
  console.log(`rendered ${files.length} slides + preview.png in ${path.relative(ROOT, postDir)}`);
  if (failed) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

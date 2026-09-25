// Renderiza la animación fotograma a fotograma con Chromium (Playwright).
// Uso: node tools/render.mjs <carpeta_salida> [fps] [t1,t2,... solo esos instantes]
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/opt/node22/lib/node_modules/playwright"); }

const out = process.argv[2] || "frames";
const fps = Number(process.argv[3] || 30);
const only = process.argv[4] ? process.argv[4].split(",").map(Number) : null;
fs.mkdirSync(out, { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const file = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../index.html");
await page.goto("file://" + file + "?capture");
const canvas = await page.$("#c");
const times = only || Array.from({ length: fps * 10 }, (_, i) => i / fps);
for (let i = 0; i < times.length; i++) {
  await page.evaluate(t => window.renderAt(t), times[i]);
  const name = only ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(4, "0")}.png`;
  await canvas.screenshot({ path: path.join(out, name) });
}
await browser.close();
console.log(`listo: ${times.length} fotogramas en ${out}`);

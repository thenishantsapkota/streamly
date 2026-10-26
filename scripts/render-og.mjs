// Renders public/opengraph-image.png (1200x630). Run: node scripts/render-og.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createElement as h } from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const mark = readFileSync(new URL("../lib/brand-mark.ts", import.meta.url), "utf8");
const pick = (name) => mark.match(new RegExp(`${name} = "([^"]+)"`))[1];
const [BARS, PLAY, LIGHT, ACCENT] = ["MARK_BARS", "MARK_PLAY", "MARK_LIGHT", "MARK_ACCENT"].map(pick);

const tree = h(
  "div",
  {
    style: {
      height: "100%", width: "100%", background: "#0a0a0a", color: "#ecebe8", display: "flex",
      flexDirection: "column", justifyContent: "center", padding: 80, fontFamily: "Bricolage",
    },
  },
  h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 28 } },
    h(
      "svg",
      { width: 104, height: 104, viewBox: "0 0 64 64" },
      h("path", { d: BARS, fill: LIGHT, fillRule: "evenodd" }),
      h("path", { d: PLAY, fill: ACCENT, stroke: ACCENT, strokeWidth: 1.6, strokeLinejoin: "round" }),
    ),
    h(
      "div",
      { style: { display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: 14 } },
      h("span", null, "STREAM"),
      h("span", { style: { color: ACCENT } }, "LY"),
    ),
  ),
  h("div", { style: { marginTop: 40, fontSize: 52, fontWeight: 700, lineHeight: 1.1, maxWidth: 960 } }, "Films, series and anime in one place."),
  h("div", { style: { marginTop: 28, fontSize: 30, color: "#8f8e8a", fontFamily: "Hanken", fontWeight: 500 } }, "Your progress saved as you watch."),
);

const font = (pkg, file) => readFileSync(new URL(`../node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url));
const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Bricolage", data: font("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"), weight: 800 },
    { name: "Bricolage", data: font("bricolage-grotesque", "bricolage-grotesque-latin-700-normal.woff"), weight: 700 },
    { name: "Hanken", data: font("hanken-grotesk", "hanken-grotesk-latin-500-normal.woff"), weight: 500 },
  ],
});
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
writeFileSync(new URL("../public/opengraph-image.png", import.meta.url), png);
console.log("wrote public/opengraph-image.png");

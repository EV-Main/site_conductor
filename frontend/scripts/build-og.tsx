// Renders public/opengraph-image.png — the social preview card — from SITE copy,
// the brand tokens and the shared logo, so it can no longer drift from the site
// the way the hand-exported Figma PNG it replaces did. Wired into prebuild and
// the flake's image buildPhase; the output is committed so a checkout serves the
// card without a build.
//
// Satori (bundled in next/og) is not a browser: only flexbox lays out, every box
// with more than one child needs an explicit `display: flex`, and it cannot read
// variable fonts — hence the pinned static instances in scripts/og-fonts/. They
// are cut from the same faces the site loads (application/styles/fonts, see its
// README) with, per weight:
//
//   fonttools varLib.instancer <face>-Variable.woff2 opsz=32 wght=400 -o inst.ttf
//   fonttools subset inst.ttf --unicodes=U+0020-007E,U+00A0,U+00B7,U+2013,U+2014,U+2018-201D,U+2026
//
// The card's charset is fixed English copy, so the site's much wider coverage
// (Vietnamese, Greek, Cyrillic) is deliberately not carried here.
//
// The geometry constants below were fitted against the Figma export.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";

import { SITE } from "../shared/config/site";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = (file: string) =>
  readFileSync(path.join(root, "scripts/og-fonts", file));

const MIST = SITE.theme.mist;
const ACCENT = SITE.theme.accent;
const HAIRLINE = "rgba(230,225,211,0.09)";

const ACCENTED = "China+1";
const [lead, trail] = SITE.tagline.split(ACCENTED);
if (trail === undefined)
  throw new Error(`SITE.tagline no longer contains "${ACCENTED}"`);

// The lockup ships black — the site paints it through a CSS mask; satori draws
// SVG as-is, so recolour it here.
const logo = readFileSync(
  path.join(root, "public/assets/logo.svg"),
  "utf8"
).replaceAll('"black"', `"${MIST}"`);

const card = (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: 1200,
      height: 630,
      padding: "71px 92px 0",
      backgroundColor: SITE.theme.black,
      backgroundImage: `radial-gradient(1250px 1000px at 1180px 520px, #154a5c 0%, ${SITE.theme.black} 80%)`,
      fontFamily: "Inter",
      color: MIST,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 8,
        height: 630,
        backgroundImage: "linear-gradient(180deg, #3cc7b6, #1c6a61)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 26,
        top: 26,
        width: 1146,
        height: 576,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 18,
      }}
    />

    <div style={{ display: "flex" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori rasterises <img>, not next/image */}
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`}
        height={88}
        width={102}
        alt=""
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 14,
          marginTop: 9,
        }}
      >
        <div
          style={{
            fontSize: 41,
            fontWeight: 700,
            letterSpacing: 2.2,
            lineHeight: 1,
          }}
        >
          {SITE.name.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: 6,
            lineHeight: 1,
            color: ACCENT,
          }}
        >
          {SITE.alternateName.toUpperCase()}
        </div>
      </div>
    </div>

    <div
      style={{
        marginTop: 122,
        fontSize: 19,
        fontWeight: 600,
        letterSpacing: 5.1,
        lineHeight: 1,
        color: ACCENT,
      }}
    >
      PREMIUM REAL ESTATE FUND
    </div>

    <div
      style={{
        display: "flex",
        marginTop: 17,
        fontFamily: "Playfair",
        fontSize: 68,
        lineHeight: 1,
        whiteSpace: "pre",
      }}
    >
      <span>{lead}</span>
      <span style={{ fontStyle: "italic", color: ACCENT }}>{ACCENTED}</span>
      <span style={{ fontStyle: "italic" }}>{trail}</span>
    </div>

    <div
      style={{
        marginTop: 35,
        width: 850,
        fontSize: 28,
        lineHeight: 1.393,
        color: "#b9c2d0",
      }}
    >
      {SITE.description}
    </div>

    <div style={{ display: "flex", flexGrow: 1 }} />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 33,
        paddingTop: 28,
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <div style={{ display: "flex" }}>
        {["Bank transfer", "Crypto"].map(rail => (
          <div
            key={rail}
            style={{
              display: "flex",
              alignItems: "center",
              height: 40,
              marginRight: 28,
              padding: "0 19px",
              borderRadius: 20,
              border: "1px solid rgba(42,157,143,0.5)",
              fontSize: 20,
              color: "#cdd5e1",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                marginRight: 10,
                borderRadius: 4,
                backgroundColor: ACCENT,
              }}
            />
            {rail}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 20, letterSpacing: 1.8, color: "#8a96ac" }}>
        Quy Nhon · Vietnam
      </div>
    </div>
  </div>
);

const png = await new ImageResponse(card, {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "Inter",
      data: font("Inter-Regular.ttf"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: font("Inter-Bold.ttf"),
      weight: 700,
      style: "normal",
    },
    {
      name: "Playfair",
      data: font("Playfair-Regular.ttf"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Playfair",
      data: font("Playfair-Italic.ttf"),
      weight: 400,
      style: "italic",
    },
  ],
}).arrayBuffer();

const out = path.join(root, "public/opengraph-image.png");
writeFileSync(out, Buffer.from(png));
console.log(`og: wrote ${out} (${png.byteLength} bytes)`);

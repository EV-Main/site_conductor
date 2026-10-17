# Fonts

Four subset `.woff2` faces, loaded by [`./index.ts`](./index.ts) through
`next/font/local`, plus the two Source Serif 4 faces of the coming-soon page
([`./source-serif.ts`](./source-serif.ts), see the last section). They are committed as real bytes (not LFS — see
[`.gitattributes`](./.gitattributes)) because `next build` reads them and the
production image builds hermetically under Nix.

## Why they are subset

The upstream variable TTFs are **5.0 MB** across the four faces, and `next/font`
emits a `<link rel=preload>` for _every_ `src` entry. On a cold visit the hero's
96px Playfair headline therefore painted in the fallback face for most of a
second before swapping — the flicker this pipeline exists to remove.

| Face            | Upstream `.ttf` | Subset `.woff2` |
| --------------- | --------------: | --------------: |
| Inter           |          854 KB |          239 KB |
| Inter Italic    |          883 KB |          264 KB |
| Playfair        |        1 620 KB |          178 KB |
| Playfair Italic |        1 732 KB |          209 KB |
| **Total**       |    **5 089 KB** |      **890 KB** |

## Coverage

Latin-1, Latin Extended-A/B, combining marks, Vietnamese (`U+1EA0–1EF9` plus the
horned/barred letters — Quy Nhơn, Đà Nẵng and friends appear in copy), Greek,
punctuation, currency, letterlike, arrows, math operators, geometric shapes and
dingbats. Inter additionally carries Cyrillic (`U+0400–04FF`) for the
concept-interface toast in `shared/lib/utils.ts`; Playfair does not — headings
are never Cyrillic.

The ranges are not guesswork: **`public/mfe/*.html` is part of the corpus.** The
REA portfolio widget on the homepage sets financial notation in Greek (`Δ`, `Σ`,
`ρ`, `γ`) and marks rows with `✓` / `★`, none of which appear anywhere in this
repo's own sources. Re-scan the shipped bytes, not just `app/`+`views/`, before
narrowing anything:

```sh
python - <<'PY'
import glob, collections
c = collections.Counter()
for p in glob.glob('public/**/*', recursive=True) + glob.glob('{app,views,features,entities,shared,application}/**/*', recursive=True):
    try: t = open(p, encoding='utf-8').read()
    except Exception: continue
    c.update(ch for ch in t if ord(ch) > 0x7F)
print(''.join(sorted(c)))
PY
```

Playfair genuinely has no `✓ ★ γ ρ Σ` upstream — those are Inter's, and every
place they render is sans. `ℹ` is absent from Inter upstream but only ever goes
to `console.log`.

Both families keep their `opsz` axis: browsers apply `font-optical-sizing: auto`
by default, and it is doing real work at the hero's 96px. Playfair's `wdth` axis
is instanced out at its default `112.5` — nothing sets `font-stretch`, and the
axis cost ~30% of the file.

## Regenerating

Upstream sources are the Google Fonts releases —
[Inter](https://github.com/googlefonts/inter/releases),
[Playfair](https://github.com/googlefonts/playfair) (the redesigned
`opsz,wdth,wght` family, _not_ Playfair Display). Drop the four variable TTFs in
this folder, then:

```sh
pip install fonttools brotli

BASE='U+0000-00FF,U+0100-024F,U+0259,U+02B0-02FF,U+0300-036F,U+0370-03FF,U+1EA0-1EF9,U+2000-206F,U+2070-209F,U+20A0-20C0,U+2100-214F,U+2190-21FF,U+2200-22FF,U+25A0-25FF,U+2600-27BF,U+FEFF,U+FFFD'
FEAT='kern,liga,clig,calt,ccmp,locl,mark,mkmk,rlig,frac,numr,dnom,sups,subs,tnum,onum,lnum,pnum,case,salt,ss01,ss02,ss03'
sub() { python -m fontTools.subset "$1" --output-file="$2" --flavor=woff2 \
  --unicodes="$3" --layout-features="$FEAT" --name-IDs='*' --name-legacy \
  --notdef-outline --recalc-bounds --drop-tables+=DSIG; }

# Playfair: pin wdth to its default first, then subset.
for s in '' '-Italic'; do
  python -m fontTools.varLib.instancer \
    "Playfair${s}-VariableFont_opsz,wdth,wght.ttf" wdth=112.5 -o "pf${s}.ttf"
done
sub pf.ttf        Playfair-Variable.woff2        "$BASE"
sub pf-Italic.ttf Playfair-Italic-Variable.woff2 "$BASE"
sub 'Inter-VariableFont_opsz,wght.ttf'        Inter-Variable.woff2        "$BASE,U+0400-04FF"
sub 'Inter-Italic-VariableFont_opsz,wght.ttf' Inter-Italic-Variable.woff2 "$BASE,U+0400-04FF"

rm -f pf.ttf pf-Italic.ttf *VariableFont*.ttf
```

Widening `BASE` is cheap for Inter and expensive for Playfair — measure before
adding a range, and drop anything that only ever appears in source comments (the
box-drawing rules, for one).

## Source Serif 4 (coming-soon page)

`SourceSerif4-Variable.woff2` (112 KB) is the upstream roman variable font from
[google/fonts `ofl/sourceserif4`](https://github.com/google/fonts/tree/main/ofl/sourceserif4),
with `wght` narrowed to the 300–500 the headline uses and Latin-1 plus general
punctuation kept — the page's display copy is English in every locale.
`SourceSerif4-Italic-Light.woff2` (35 KB) is the italic pinned at 300 and cut to
printable ASCII: it only sets the `E[V]` label on the terrain.

```sh
python -m fontTools.varLib.instancer 'SourceSerif4[opsz,wght].ttf' wght=300:500 -o r.ttf
python -m fontTools.varLib.instancer 'SourceSerif4-Italic[opsz,wght].ttf' wght=300:300 -o i.ttf
FEAT='kern,liga,clig,calt,ccmp,locl,mark,mkmk,rlig,case,lnum,pnum'
python -m fontTools.subset r.ttf --output-file=SourceSerif4-Variable.woff2 --flavor=woff2 \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193' \
  --layout-features="$FEAT" --name-IDs='*' --name-legacy --notdef-outline --recalc-bounds --drop-tables+=DSIG
python -m fontTools.subset i.ttf --output-file=SourceSerif4-Italic-Light.woff2 --flavor=woff2 \
  --unicodes='U+0020-007E' \
  --layout-features="$FEAT" --name-IDs='*' --name-legacy --notdef-outline --recalc-bounds --drop-tables+=DSIG
```

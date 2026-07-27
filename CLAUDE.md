# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

GeneraPass is a client-side password generator made of three static files: `index.html` (markup), `styles.css` (styles), and `app.js` (logic). There is no build system, package manager, dependency list, or test suite.

## Running the app

There is no build/lint/test tooling. To work on the app, open `index.html` directly in a browser (double-click it, or use a simple static file server if testing clipboard/localStorage behavior that requires `http://` rather than `file://`):

```
start index.html
```

Changes take effect immediately on reload — there is no compile step.

## Design

The UI follows an editorial "spec sheet" layout (`diseño.md` documents the original brief): a two-column sheet — a left rail with the theme toggle, and a right content column with numbered rows (`01` Tipo, `02` Longitud/Número de palabras, `03` Fortaleza, `04` Composición, `05` Clave generada). The app name is intentionally not displayed anywhere in the UI. All colors are CSS custom properties on `:root` (blue accent, neutral paper/ink), overridden for dark mode via `@media (prefers-color-scheme: dark)` and forced either way via `body.light-mode`/`body.dark-mode` — see `styles.css` for the token list. Icons are inline SVG `<symbol>` defs at the top of `index.html` (`#i-copy`, `#i-check`, `#i-refresh`, `#i-sun`, `#i-moon`), referenced elsewhere via `<use href="#i-...">` — no icon font or CDN dependency.

## Architecture

- **`index.html`** — UI controls only: a mode toggle (`random`/`phrase` radios), a length/word-count slider+number pair, two mutually-exclusive switch groups (`#switchesRandom`, `#switchesPhrase`) shown depending on mode, and the strength meter/password/buttons markup. There is no output-format toggle and no "spaces" option — both were dropped in the redesign per `diseño.md`.
- **`styles.css`** — all styling and the light/dark token definitions described above.
- **`app.js`** — all behavior:
  - **Mode switching (`applyMode`)** — reads the checked `input[name="mode"]` radio and, per `MODE_CONFIG`, reconfigures the *same* slider/number pair (`min`/`max`/`default`/aria-labels) for either character length (4–128, default 16) or word count (3–12, default 6), swaps which switch group is visible, and regenerates. `syncLength` clamps against the slider's *current* `min`/`max` (not hardcoded constants) so it works correctly under either mode.
  - **Random-mode generation (`generatePassword` / `generateFromClasses`)** — `buildClassPools()` returns one string per checked character class (numbers/uppercase/lowercase/symbols), each already run through `filterAmbiguous` if `noAmbiguous` is checked (`AMBIGUOUS` set: `0O o1lI5S8B`). Generation reserves one random position per selected class (so every enabled class is guaranteed to appear at least once — pure uniform sampling can otherwise omit a class by chance, which would fail sites that require e.g. "at least one symbol"), fills the remaining length by uniform draw over the combined pool, then Fisher-Yates shuffles the result. All randomness (character draws and the shuffle) comes from `getRandomInt`, which uses `crypto.getRandomValues` (not `Math.random`).
  - **Phrase-mode generation (`generatePhrase`)** — draws N words uniformly (with replacement) from the `WORDS` array (~300 curated Spanish nouns, embedded so the app stays offline/dependency-free), joined with `-`. `phraseNumber` appends a random digit to one random word; `phraseCapitalize` capitalizes every word's first letter — this is formatting only and adds no entropy.
  - **Strength indicator (`calculateEntropyBits`/`calculatePhraseEntropyBits`, `classifyEntropy`, `updateMeter`)** — since passwords here are sampled uniformly from a known pool/wordlist (not typed by a human), strength is real Shannon entropy rather than a heuristic score: `length × log2(poolSize)` bits in random mode, `wordCount × log2(WORDS.length)` bits (plus `log2(10)` if a number is appended) in phrase mode. Bits map to one of four levels at fixed thresholds (weak <40, fair <60, medium <80, strong ≥80), each with its own color set via `meter.dataset.level` and consumed by CSS; the label shows both the level name and the rounded bit count. These semantic colors are deliberately separate from the blue accent color used elsewhere. The reserved-per-class guarantee in random mode slightly reduces true entropy versus pure uniform sampling, but the effect is negligible at realistic lengths, so (matching industry convention, e.g. Bitwarden/1Password) it isn't corrected for.
  - **Dark mode (`syncThemeIcon`, theme-toggle click handler)** — respects `prefers-color-scheme` by default; clicking the toggle forces `body.dark-mode` or `body.light-mode` and persists the explicit choice in `localStorage` under the key `theme` (`"dark"` / `"light"`). Until the user toggles it explicitly, the page tracks OS theme changes live via a `matchMedia` listener.
  - **Clipboard (`copyPassword`, `clearClipboardIfUnchanged`)** — writes via `navigator.clipboard.writeText`, falling back to `passwordField.select()` if the clipboard API throws; feedback is a non-blocking toast plus an `aria-live` status update (no blocking `alert()`). 25s after copying, it reads the clipboard back and only clears it if the contents still match what was copied (so it doesn't clobber something else the user copied in the meantime); if clipboard-read permission is denied, it silently skips the clear rather than prompting.

All IDs referenced in `app.js` (`length`, `lengthNumber`, `lengthIndex`, `modeRandom`/`modePhrase`, `switchesRandom`/`switchesPhrase`, `uppercase`, `lowercase`, `numbers`, `symbols`, `noAmbiguous`, `phraseCapitalize`, `phraseNumber`, `password`, `meter`, `meterLabel`, `hint`, `copyBtn`, `generateBtn`, `themeToggle`, `srStatus`, `toast`) are wired by direct `document.getElementById` calls with no event delegation or framework — when adding a new character-class option, add it to both the `switches` object and `buildClassPools()`.

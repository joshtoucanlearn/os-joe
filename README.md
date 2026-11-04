# OS_Joe

**Since 4 Nov 2026 the live site is a plain static build in `docs/` (pixel sky, "Hello Joe", Projects: DARTY, Drinks, Notes wall, Snake, Frogger), in the same style as Rayansh's site.** Edit `docs/` directly. The Next.js source below is the old site, kept for reference only: do not run `scripts/prepare-pages.py`, as it would overwrite `docs/`. Old paths (`home/`, `arcade/`, `products/`, `write/`) redirect.

Joe’s personal project showcase: original drink designs, rotating 3D bottle models, a sticky-note wall and arcade.

## Development

Requires Node.js 22.13 or later and pnpm. Install with `pnpm install --frozen-lockfile`, run `pnpm dev`, then use the local preview. The exported site opens at `/os-joe/`, with the workspace at `/os-joe/home/`.

Run `pnpm test` and `pnpm build` before publishing. Static output is in `dist/client`. GitHub Pages publishes the `docs` folder on the main branch. To update: build, run `python3 scripts/prepare-pages.py`, commit source and docs, then push.

After preparing Pages, run `node scripts/review-pages.mjs` with Chrome and Playwright available (`PLAYWRIGHT_MODULE` can point to an installed module). It checks every page at 1440×750 and 390×844 in light and dark, saves screenshots in `outputs/pages-review/`, then runs the existing sky checks. The shared wall uses an empty fixture; real notes are untouched.

## Data and artwork

Sticky notes are saved in the shared D1-backed wall service. The wall opens directly without a code; anyone with the link can read and change notes from any device. Notes can also be downloaded as text. Earlier notebook drafts remain untouched in browser storage. No learner assessments, family correspondence or teacher notes are included.

Drink artwork is retained from the original lessons. Rotating bottle geometry and unseen surfaces are reconstructions. Ground Pinch remains a concept template. Existing OS_Harriet components provided the visual framework and arcade.

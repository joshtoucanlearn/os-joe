# OS_Joe

Joe’s personal project showcase: original drink designs, rotating 3D bottle models, a sticky-note wall and arcade.

## Development

Requires Node.js 22.13 or later and pnpm. Install with `pnpm install --frozen-lockfile`, run `pnpm dev`, then use the local preview. The exported site opens at `/os-joe/`, with the workspace at `/os-joe/home/`.

Run `pnpm test` and `pnpm build` before publishing. Static output is in `dist/client`. GitHub Pages publishes the `docs` folder on the main branch. To update: build, run `python3 scripts/prepare-pages.py`, commit source and docs, then push.

## Data and artwork

Sticky notes are saved in the shared D1-backed wall service. The same wall code allows Joe and his tutors to read and change them from any device. The code is kept only for the current tab session and is never bundled into the site. Notes can also be downloaded as text. Earlier notebook drafts remain untouched in browser storage. No learner assessments, family correspondence or teacher notes are included.

Drink artwork is retained from the original lessons. Rotating bottle geometry and unseen surfaces are reconstructions. Ground Pinch remains a concept template. Existing OS_Harriet components provided the visual framework and arcade.

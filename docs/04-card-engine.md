# Card engine

All cards are drawn on an HTML canvas by **one function**: `drawCard(ctx, data, opts, scale)` in `src/lib/card/draw.ts`. The same code powers the live preview, the PNG, the GIF frames and the video, so what you see is exactly what you download.

## Time model
`t` goes from 0 to 1 over `CLIP_SECONDS` (4.5 s). Backgrounds loop seamlessly (integer-frequency sines, rotations of exactly one symmetry step). Animations finish by roughly t = 0.85 and then hold.

## Designs (`themes.ts`, backgrounds in `draw.ts`)
- **Chand**: midnight sky, glowing moon, twinkling stars, chhalni dot rings (Karwa Chauth)
- **Sindoor**: crimson and gold, rotating mandala, double gold frame (festive/shaadi)
- **Aurora**: drifting neon blobs on a faint grid (Gen Z default for "fun")
- **Pop**: neo-brutalist pastel, hard shadows, halftone, starburst

## Animations
- **Rise**: rows slide up in sequence, bars fill, crown drops, confetti
- **Spotlight**: scene dims; a spotlight reveals rows last-to-first, landing on the winner
- **Shuffle**: slot-machine names/percentages that lock one by one, winner last with a flash

## Card kinds
`invite` (sealed contenders with shimmer), `result` (leaderboard + verdict), `pick` (my vote, stamped "vote locked").

## Formats
`story` 1080x1920, `square` 1080x1080. Preview scale 0.667.

## Exports (`export.ts`)
- PNG: 1080 wide, t = 0.9
- GIF: 0.5 scale, 50 frames, gifenc with per-frame palette, loops forever
- Video: real-time `MediaRecorder` of the canvas at 0.667 scale (MP4 on Safari, WebM elsewhere)
- Share: `navigator.share({files})` with a PNG, falling back to download + link sheet

## Fonts
`ensureFonts()` reads the CSS variables from `next/font` and awaits `document.fonts.load` so canvas text matches the site.

## Adding a design
Add an id to `DesignId` and `DESIGN_LIST` (`types.ts`), a `Theme` in `themes.ts`, and a background function in `BACKGROUNDS` (`draw.ts`).

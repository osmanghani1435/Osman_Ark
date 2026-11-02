# RENANDO. — Editor & VFX Artist Portfolio

A single-page, dark-cinematic portfolio website cloned from the reference screen recording
(black / white / crimson palette, Bebas Neue display type, Netflix-style editorial feel).
Pure static HTML + CSS + vanilla JS — no build step.

## Entry point
- `index.html` — the whole site (single page, anchor navigation)
- `css/style.css` — theme, layout, responsive breakpoints (1100px / 860px / 480px)
- `js/main.js` — all interactions

## Sections (in order)
1. **Header** — fixed, transparent → blurred on scroll; active-link underline; mobile hamburger menu; red "Hire Me" CTA.
2. **Hero** (`#home`) — 3-column: intro text + CTAs, framed portrait with REC/4K viewfinder tags, stacked stat badges (3+ / 18+ / 10+) with animated counters. Giant outlined `PORTFOLIO` background word with parallax, red glow, scroll hint.
3. **Karya / Works** (`#karya`) — "KARYA YANG BICARA." Filter pills (Semua, VFX, Film, Commercial, Photography, Music Video, Manipulasi, Animasi), horizontally scrolling card track (snap + drag + arrow buttons), hover play button. "TRUSTED BY & COLLABORATION" infinite marquee of partner names.
4. **Awards** (`#penghargaan`) — "THE WORK. THE RECOGNITION." red `10+` with laurel SVGs, 6-row award list with red years; floating image preview follows the cursor on hover (desktop).
5. **Before/After** (`#breakdown`) — "FROM RAW. TO REAL." draggable comparison slider (raw/grayscale left, graded right), red knob with chevrons, legend buttons animate the handle.
6. **Tentang / Philosophy & Skills** (`#tentang`) — 3 cards: Education & Skills (with tool badges Pr/Ae/Dv/Bl/Nk/Ps/Ai), production pipeline stepper (01–04), red quote card.
7. **Perjalanan / Career** (`#perjalanan`) — vertical timeline 2019→now, sticky "LITTLE WINS. BIG MEANING." box with CTA.
8. **Kontak / Contact** (`#kontak`) — giant "LET'S WORK TOGETHER.", email / WhatsApp / location rows, social pills, "MAKE IT FEEL REAL." card (back to top).
9. **Footer** — copyright bar with pulsing status dot.
10. **Showreel modal** — opened by "Play Showreel" and any work card; sample placeholder MP4.

## Extras (beyond the original)
- Custom circular cursor with contextual labels (PLAY / VIEW) + red/white triangle particle trail (desktop, pointer:fine only; disabled on touch & reduced-motion).
- Top scroll-progress bar, scroll-reveal animations (IntersectionObserver), hover micro-interactions everywhere.
- Fully responsive; `prefers-reduced-motion` respected.
- Debug: append `?reveal=all` to the URL to disable scroll-reveal (shows all content immediately).

## Replacing placeholder content
All images are Unsplash placeholders — search `images.unsplash.com` in `index.html` and swap:
- Hero portrait: `.hero__photo`
- Work thumbnails: `.work__media img`
- Award hover previews: `data-img` on each `.award`
- Before/After: both `.ba__img` (ideally use a true raw frame and a graded frame of the same shot — the raw look is currently simulated with CSS filters)
- Showreel video: `<source>` inside `#reelVideo` (and its `poster`)
- Contact: email / WhatsApp link / social URLs in `#kontak`

## Storage / data
None — fully static, no tables, no backend.

## Status
- ✅ All sections built and visually verified (desktop 1280px and mobile 390px), console clean.
- ⬜ Not deployed yet (preview only). Hosted Deploy can be done on request.
- Suggested next steps: replace placeholder media, add real project links/videos per card, optionally wire a contact form.

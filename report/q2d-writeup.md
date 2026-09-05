# Q2(d) — Performance and Critical Evaluation

## Testing methodology
Tested locally (`python3 -m http.server`) using the browser's Resource Timing and Navigation Timing APIs — the same underlying data Chrome DevTools' Network panel and Lighthouse read from — captured at two viewports: **375×812 @2x DPR** (mobile) and **desktop width**. Keyboard operability, colour contrast and ARIA state were checked directly against the live DOM.

**Caveat to state in the report:** localhost has no real network latency, so load-time figures here are not comparable to a real 4G/Wi-Fi test. The resource *sizes* and *loading behaviour* are real and valid evidence regardless of host; before final submission, re-run this once the page is hosted (Section below: "To do once hosted") to also capture an official Lighthouse score and PageSpeed Insights screenshot for the report.

---

## Largest / heaviest resources

**Desktop (full page, after scrolling to reveal all lazy content):**

| Resource | Size | Notes |
|---|---|---|
| `timeline-1-1600.jpg` | 178.3 KB | NASA Space Apps timeline photo — largest single resource |
| `gallery-1-800.jpg` | 164.3 KB | NASA Space Apps poster |
| `gallery-4-800.jpg` | 149.6 KB | HackWknd poster |
| `gallery-3-800.jpg` | 103.6 KB | Closing ceremony grid |
| `gallery-2-800.jpg` | 91.2 KB | "2nd Runner-Up" reveal |
| `hero-1200.webp` | 83.0 KB | Hero image (WebP) |
| `css/style.css` | 5.3 KB | |
| `js/script.js` | 1.3 KB | |
| Embedded video iframe (`youtube-nocookie.com`) | *not measurable* | Cross-origin — browser doesn't expose YouTube's internal transfer size to the embedding page. Its real cost (player JS + video stream) is entirely deferred until the visitor presses play. |

**Total measured page weight (desktop, everything loaded): ≈777 KB** across 8 same-origin resources, excluding the video (which is 0 bytes until played).

**Mobile (375px, 2× device pixel ratio):**

| Resource | Size | vs. desktop |
|---|---|---|
| `timeline-1-900.jpg` | 73.6 KB | −59% vs. the 1600w desktop candidate |
| `hero-900.webp` | 56.6 KB | −32% vs. the 1200w desktop candidate |
| Gallery images (`gallery-1..4-800.jpg`) | 164.3 / 91.2 / 103.6 / 149.6 KB | **unchanged from desktop** — see note below |

**Total measured page weight (mobile): ≈646 KB.**

**Why the gallery images didn't shrink on mobile:** the emulated mobile device reports a 2× device pixel ratio. With `sizes="(max-width: 600px) 100vw, ..."` and a 375px viewport, the browser needs ~750 physical pixels of image data to render it sharply — so it correctly selects the 800w candidate rather than the 400w one. **This is correct `srcset` behaviour, not a bug** — a 400w image would look visibly soft on a real high-DPI phone. It's still worth noting in the report as a nuance: naive assumptions ("mobile = smallest image") don't hold once DPR is accounted for.

---

## Loading behaviour
- **Initial load fetched only 5 resources** (`timeline-1` image, `hero` image, CSS, JS, and the video iframe document) — confirming `loading="lazy"` is correctly deferring the HackWknd timeline photo (inside a `hidden` panel) and all four gallery images until they're needed.
- Scrolling to the gallery section triggered exactly those 4 deferred images and nothing else — no over-fetching.
- The HackWknd timeline photo only loads once that tab is actually selected, since its panel starts `hidden` — confirmed it stayed unfetched even after scrolling past the gallery.
- The video iframe's own document loaded in ~214ms even though `loading="lazy"` is set on it, because the demo section sits close enough to the initial viewport in this test; the actual YouTube player/video stream itself does not load until the user presses play (embed default behaviour), so there's no autoplay cost.

## Responsive behaviour
- `srcset`/`sizes` correctly select smaller candidates at narrower viewports for the hero and timeline images (see table above).
- Gallery grid (`auto-fill, minmax(260px, 1fr)`) reflows from a 3-up desktop layout to a single column on mobile with no horizontal scroll.
- The timeline panel layout switches from a 320px-image + text two-column grid (≥700px) to a stacked single column below that — verified no overlap or clipped text at 375px.
- The video's 16:9 `aspect-ratio` wrapper scales fluidly at both viewport widths with no layout shift when the iframe loads (confirmed via `width`/`height` reservation).

## Accessibility checks
| Check | Result |
|---|---|
| All `<img>` have non-empty `alt` | ✅ 7/7 images |
| Iframe has descriptive `title` | ✅ |
| Text vs. background contrast (`#1e293b` on white) | ✅ 14.6:1 (WCAG AAA) |
| Muted text vs. background (`#64748b` on white) | ✅ 4.76:1 (passes AA for normal text; close to the 4.5:1 minimum — worth keeping an eye on if the muted colour is ever darkened for a redesign) |
| Button/link accent vs. background (`#4f46e5`) | ✅ 6.29:1 (passes AA) |
| Timeline keyboard operability | ✅ `ArrowRight` from tab 1 moved focus to tab 2, updated `aria-selected`, and un-hid the correct panel — confirmed via direct DOM/event testing |
| Skip-to-content link present | ✅ |
| `prefers-reduced-motion` media query present and recognised by the browser | ✅ (structural check; recommend also manually toggling "Reduce motion" in OS settings once hosted, as a final human check) |

No accessibility problems were found in this pass.

## Critical decision: what should be modified, replaced or removed
**Modify — extend the WebP treatment already applied to the hero image to the timeline and gallery photos.** The hero image shows WebP cutting file size by roughly 60% over the JPEG at the same dimensions (based on the Q1-style comparison already done for that image). Applying the same conversion to `timeline-1-1600.jpg` (178.3 KB) and the four gallery images (91–164 KB each) would plausibly cut total measured page weight from ~777 KB to somewhere in the 280–320 KB range, with no visible quality loss, since JPEG-to-WebP at matched quality settings is a near-free size win for photographic content.

**No element causes an unacceptable cost.** Every individual image stays under 180 KB and loads lazily/responsively; the one element with a genuinely unbounded cost — the embedded video — has that cost entirely deferred until the visitor opts in by pressing play, which was the explicit design trade-off documented in Q2(a)/the media asset log (embed vs. self-host). Given that trade-off was deliberate and disclosed, it isn't flagged as a problem here.

---

## To do once the page is hosted (for the report's official evidence)
1. Run PageSpeed Insights (`pagespeed.web.dev`) against the live URL for an official Lighthouse score + screenshot (desktop and mobile).
2. Screenshot the "Loading behaviour" waterfall in Chrome DevTools → Network tab, showing the same lazy-load pattern confirmed above.
3. Toggle **Settings → Accessibility → Reduce Motion** (macOS) or the equivalent OS setting, reload the page, and confirm the timeline transition is suppressed — screenshot this for the accessibility evidence section.

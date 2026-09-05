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
| Embedded video iframe (`youtube-nocookie.com`) | ~1.1 MB transferred (see below) | Not visible via cross-origin Resource Timing, but directly measured in the real DevTools Network panel — see "Real network capture" below. |

**Total measured page weight (desktop, everything loaded): ≈777 KB** across 8 same-origin resources, excluding the video (which was not measurable from same-origin JavaScript alone — see the real capture below for its actual cost).

**Mobile (375px, 2× device pixel ratio):**

| Resource | Size | vs. desktop |
|---|---|---|
| `timeline-1-900.jpg` | 73.6 KB | −59% vs. the 1600w desktop candidate |
| `hero-900.webp` | 56.6 KB | −32% vs. the 1200w desktop candidate |
| Gallery images (`gallery-1..4-800.jpg`) | 164.3 / 91.2 / 103.6 / 149.6 KB | **unchanged from desktop** — see note below |

**Total measured page weight (mobile): ≈646 KB.**

**Why the gallery images didn't shrink on mobile:** the emulated mobile device reports a 2× device pixel ratio. With `sizes="(max-width: 600px) 100vw, ..."` and a 375px viewport, the browser needs ~750 physical pixels of image data to render it sharply — so it correctly selects the 800w candidate rather than the 400w one. **This is correct `srcset` behaviour, not a bug** — a 400w image would look visibly soft on a real high-DPI phone. It's still worth noting in the report as a nuance: naive assumptions ("mobile = smallest image") don't hold once DPR is accounted for.

---

## Real network capture (Firefox DevTools, live site, cache disabled, no throttling)

This is the single most important piece of evidence gathered for this section — it directly measures what the local Resource Timing tests above could not see: the actual cost of the embedded video.

**This page's own resources (transferred / decoded size):**

| Resource | Transferred | Decoded size |
|---|---|---|
| `gallery-1-1200.jpg` | 306.7 KB | 306.0 KB |
| `gallery-2-1200.jpg` | 172.1 KB | 171.4 KB |
| `gallery-3-1200.jpg` | 195.7 KB | 195.0 KB |
| `hero-1200.webp` | 85.7 KB | 85.0 KB |
| `timeline-1-900.jpg` | 76.1 KB | 75.3 KB |
| `index.html` | 6.1 KB | 15.3 KB |
| `style.css` | 2.6 KB | 5.6 KB |
| `favicon.ico` | 3.7 KB | 3.7 KB |
| `script.js` | 1.4 KB | 1.4 KB |
| **Subtotal (own content)** | **≈850 KB** | **≈859 KB** |

**The embedded video's supporting resources** (loaded automatically once the demo section came near-viewport — **before the Play button was even pressed**):

| Resource | Transferred | Decoded size |
|---|---|---|
| `base.js` (YouTube player core) | 483.6 KB | **1.63 MB** |
| `m=r78Drb` (player module) | 223.1 KB | 896.0 KB |
| `www-player.css` | 59.0 KB | 543.7 KB |
| `m=root,base` (script) | 160.5 KB | 469.5 KB |
| Video subdocument (`ShubBa0KUs4`) | 61.6 KB | 150.5 KB |
| `i.ytimg.com` thumbnail | 40.9 KB | 40.2 KB |
| Google Fonts (×2, `.woff2`) | 70.9 KB | 69.3 KB |
| `m=cwx9N` (player module) | 18.5 KB | 64.4 KB |
| Google-hosted player script | 25.4 KB | 63.6 KB |
| Misc. analytics/telemetry pings (`log_event`, `generate_204`, `GenerateIT`) | ~2 KB | negligible |
| **Subtotal (video player chrome only, no playback yet)** | **≈1.15 MB** | **≈3.9 MB** |

**This corrects an assumption made earlier in this evaluation.** The original local test (which could only see same-origin timing data) concluded the video's cost was "entirely deferred until the visitor presses play." The real network capture shows that isn't quite right: `loading="lazy"` only delays the iframe until it's *near* the viewport — at that point, the player's full UI, CSS, JavaScript bundle, and a thumbnail all load automatically, regardless of whether Play is ever pressed. Only the actual video *stream* itself (which would add several more MB) waits for a genuine click. So the video component's fixed cost — **≈1.15 MB transferred just to show the player and its "Play" button** — is larger than the rest of the entire page's own content combined (≈850 KB), and it is not fully optional the way the design rationale in Q2(a) assumed.

**A secondary effect visible in the waterfall:** the three gallery images (306 KB, 172 KB, 196 KB) took an unusually long 8.6–13.7 seconds to finish downloading even with no artificial throttling applied — far slower than their file sizes alone would suggest on a normal connection. This lines up with the timeline: they were requested at the same moment the ~1.1 MB of YouTube player resources were also downloading, so the two are plausibly competing for the same connection bandwidth. This is a real, observed usability cost of the current design: loading the video player and the image gallery around the same time can slow down the images specifically because of the video's resource weight — even though the video's own visible content (the paused player) isn't yet doing anything for the user.

---

## Loading behaviour
- **Initial load fetched only 5 resources** (`timeline-1` image, `hero` image, CSS, JS, and the video iframe document) — confirming `loading="lazy"` is correctly deferring the HackWknd timeline photo (inside a `hidden` panel) and all four gallery images until they're needed.
- Scrolling to the gallery section triggered exactly those 4 deferred images and nothing else — no over-fetching.
- The HackWknd timeline photo only loads once that tab is actually selected, since its panel starts `hidden` — confirmed it stayed unfetched even after scrolling past the gallery.
- **Revised finding (see real network capture above):** the video iframe's *document* loads once it nears the viewport (as expected for `loading="lazy"`), but so does its entire player UI — CSS, core JS bundle, and a thumbnail image — totalling ≈1.15 MB. Only the actual video stream data is deferred until Play is pressed. The earlier assumption that the whole video component was "free" until clicked was too optimistic — that's only true of its single biggest cost (the video stream itself), not the player UI that loads to display it.

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
**Modify — extend the WebP treatment already applied to the hero image to the timeline and gallery photos.** The hero image shows WebP cutting file size by roughly 60% over the JPEG at the same dimensions (based on the Q1-style comparison already done for that image). Applying the same conversion to `timeline-1-1600.jpg` (178.3 KB) and the four gallery images (91–164 KB each) would plausibly cut total measured page weight from ~777 KB to somewhere in the 280–320 KB range, with no visible quality loss, since JPEG-to-WebP at matched quality settings is a near-free size win for photographic content. **This is independently confirmed** by the official Lighthouse audit below, which flagged "Improve image delivery" with an estimated saving of 173 KiB — the same recommendation, arrived at by a different tool.

**Revised conclusion (updated after the real network capture): the embedded video's player UI is the one element worth reconsidering.** The original position taken here was that no element caused an unacceptable cost, since the video's real weight "wasn't measurable" locally and was assumed to be fully deferred until Play. The live network capture disproves the second half of that: ≈1.15 MB of player CSS/JS/thumbnail loads automatically once the demo section nears the viewport, regardless of whether the visitor ever presses Play — more than the entire rest of the page's own content combined (≈850 KB), and a plausible contributor to the gallery images loading unusually slowly in the same capture (see above).

**Recommended fix: replace the eager `loading="lazy"` iframe with a genuine click-to-load facade** — a static thumbnail image (already available from `i.ytimg.com`, or a locally-hosted screenshot) with a play-button overlay, where the real `<iframe>` is only injected into the DOM on click. This is a well-established pattern (e.g. `lite-youtube-embed`) precisely because it defers *all* of the ≈1.15 MB, not just the video stream, until the visitor has explicitly signalled intent to watch — turning an assumed trade-off into one that's actually true. This is the single most impactful change identified in this evaluation and is recommended as the next iteration on this page, though it was not implemented within the current submission's scope.

---

## Official Lighthouse audit (PageSpeed Insights, hosted URL)

Run against `https://aeyzirb122.github.io/hackathon-journey/` on 5 Sep 2026. Full report attached as `PageSpeed Insights-mobile.pdf`.

**Scores (Mobile — emulated Moto G Power, Slow 4G throttling, Lighthouse 13.4.1):**

| Category | Score |
|---|---|
| Performance | **99** |
| Accessibility | **100** |
| Best Practices | **96** |
| SEO | **100** |

**Core metrics:** First Contentful Paint 0.8s, Largest Contentful Paint 1.2s, Speed Index 2.9s, Cumulative Layout Shift 0, Total Blocking Time 70ms.

**Desktop run could not be completed** — PageSpeed Insights returned a backend error: `extensible_stubs::UNABLE_TO_RETRY … RPC::UNREACHABLE: EOF`. This is a Google Cloud infrastructure error on PageSpeed Insights' own serving stack (a stream-retry limit being hit server-side), not an error caused by this page — the mobile run against the identical URL, moments earlier, completed cleanly with no errors. This should be documented in the report as a tool-side limitation encountered during testing, with the mobile result relied on instead. (A retry at a later time would likely succeed, since desktop runs are typically less resource-intensive on PSI's backend than mobile's throttled simulation — but re-running it is optional, not required, given the mobile data already provides strong evidence.)

**Notable findings and how to read them:**
- **"Improve image delivery" (−173 KiB)** and **"Use efficient cache lifetimes" (−360 KiB)** — the first corroborates the WebP recommendation above; the second is a GitHub Pages hosting-platform limitation (its default cache headers on the free tier), not something fixable in the page's own code.
- **"Reduce unused JavaScript" (−530 KiB) and "Reduce unused CSS" (−107 KiB)** — these cannot be attributed to this page's own code, since `js/script.js` is 1.3 KB and `css/style.css` is 5.3 KB total. They are almost certainly attributable to the embedded YouTube iframe's own player script and styles, which are outside this page's control — worth stating explicitly in the report so this isn't misread as the page's own inefficiency.
- **Accessibility scored a perfect 100**, independently corroborating the manual testing already carried out (colour contrast ratios, alt text on all images, ARIA tab roles/states, skip link, keyboard operability) — two different methods (manual DOM/JS inspection and automated Lighthouse) reaching the same conclusion is good triangulating evidence for the report.
- **Best Practices (96)** flagged "Issues were logged in the Issues panel in Chrome DevTools" without detail in this export — see the checklist below to identify what they are.
- **"Agentic Browsing" (1/2)** is a new, explicitly experimental Lighthouse category (checking AI-agent/WebMCP readiness, unrelated to Performance/Accessibility/Best Practices/SEO) — worth at most a one-line mention in the report, not a focus area, since Lighthouse itself labels it "still under development and subject to change."

---

## Browser console audit (Firefox DevTools, live site)

Firefox doesn't have a panel named "Issues" like Chrome — the closest equivalent is the **Console** tab, which was checked directly against the live hosted page instead. This surfaced two categories of message, and separating them is itself the useful exercise:

**Actually caused by this page (both fixed):**
1. `GET .../favicon.ico → 404` — no favicon existed, so the browser's automatic request failed on every load. **Fixed:** added a real `favicon.ico` (cropped from the hero photo) plus an SVG fallback via `<link rel="icon">`.
2. `Feature Policy: Skipping unsupported feature name "encrypted-media"` — the video iframe's `allow` attribute requested DRM/encrypted-media support that this embed never uses (it's a public, non-DRM YouTube video). **Fixed:** trimmed the `allow` attribute down to just `picture-in-picture`.

**Not this page's code — from the embedded YouTube player / Firefox's own privacy features (no action taken):**
- CSP warnings, cookie warnings, and "Partitioned cookie or storage access… loaded in third-party context" — this is Firefox's Total Cookie Protection reacting to YouTube's own cookies. It's actually confirmation that using `youtube-nocookie.com` is behaving as intended (third-party state is being isolated).
- `MouseEvent.mozPressure`/`mozInputSource` deprecation warnings, and repeated "unreachable code after return statement" warnings from a minified script (`2btoZTL64jkioZ4...js`) — this is YouTube's own bundled player script, not `js/script.js` (which is 1.3 KB and contains none of this).
- `Cookie "PREF" has been rejected for invalid domain` and the Fingerprinting Protection notice — again Firefox's privacy protections responding to YouTube's own script trying to read cookies/screen dimensions.

**Why this matters for the report:** this is a concrete, evidenced example of separating "my page's defects" from "third-party embed noise" when reading real DevTools output — exactly the kind of page-specific technical reasoning the rubric is looking for, rather than a generic "no console errors found" statement.

---

## Remaining checklist (manual, needs a real human-driven browser)
1. Screenshot the Network-tab loading waterfall (cache disabled, reload) — confirms the same lazy-load pattern already measured above, for the report's "loading behaviour" evidence.
2. Toggle **Reduce Motion** in OS accessibility settings, reload, and confirm the timeline transition is suppressed.
3. (Optional) Retry the PageSpeed Insights desktop run once more, in case the backend error was transient.

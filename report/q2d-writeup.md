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
**Modify — extend the WebP treatment already applied to the hero image to the timeline and gallery photos.** The hero image shows WebP cutting file size by roughly 60% over the JPEG at the same dimensions (based on the Q1-style comparison already done for that image). Applying the same conversion to `timeline-1-1600.jpg` (178.3 KB) and the four gallery images (91–164 KB each) would plausibly cut total measured page weight from ~777 KB to somewhere in the 280–320 KB range, with no visible quality loss, since JPEG-to-WebP at matched quality settings is a near-free size win for photographic content. **This is independently confirmed** by the official Lighthouse audit below, which flagged "Improve image delivery" with an estimated saving of 173 KiB — the same recommendation, arrived at by a different tool.

**No element causes an unacceptable cost.** Every individual image stays under 180 KB and loads lazily/responsively; the one element with a genuinely unbounded cost — the embedded video — has that cost entirely deferred until the visitor opts in by pressing play, which was the explicit design trade-off documented in Q2(a)/the media asset log (embed vs. self-host). Given that trade-off was deliberate and disclosed, it isn't flagged as a problem here.

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

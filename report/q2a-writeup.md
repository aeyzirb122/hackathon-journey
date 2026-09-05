# Q2(a) — Multimedia Architecture and Design Rationale

## Target audience
Recruiters, potential hackathon teammates, and academic evaluators reviewing my work. This is someone who will spend under two minutes deciding whether to keep reading — not someone already committed to a long read.

## Communication objective
Convince the visitor, using real evidence (working prototypes, judges' recognition, source code), that I can take an ambiguous problem statement to a working, judged prototype under real time pressure — twice, in two unrelated domains (space-data visualisation and EdTech AI).

## Key user task
Compare two hackathon achievements quickly, then drill into whichever is relevant to them. A recruiter hiring for a data/visualisation role can skip straight to DebMap; one hiring for EdTech/AI can skip straight to LearnLog. Either way, they should be able to verify the claims via real external evidence (GitHub repo, presentation video, Figma prototype) rather than take my word for it.

## Main message
"I can turn an unfamiliar problem into a working, judged prototype under real time pressure — with evidence, not just claims."

## Intended user journey
1. **Land on the hero** — an actual photo of the HackWknd award moment gives an immediate, visual proof point before any text is read.
2. **Read the two-line context paragraph** — orients the visitor to why hackathons, and what's coming.
3. **Reach the interactive timeline** — choose NASA Space Apps or HackWknd and read team, tech stack and outcome for that event only, without being forced through both sequentially.
4. **Watch the team presentation video (optional)** — for a visitor who wants more than the timeline summary, this is the actual pitch the judges heard.
5. **Skim the photo gallery** — visual proof of the scale and legitimacy of the events themselves (official posters, real ceremonies).
6. **Reach the closing CTA** — convert interest into contact.

## Media selection rationale

| Section | Medium | Why this medium over plain text |
|---|---|---|
| Hero | Photograph (`<picture>`, responsive) | A photo of the actual award moment is instantly more credible than a text claim of "I won an award" — it's evidence, not assertion, and it communicates in the first two seconds of the page, before any text is even read. |
| Interactive timeline | Tabbed interaction (HTML/CSS/JS, ARIA tablist) | The two hackathons cover unrelated domains. A single linear text block forces every visitor to read both in full even if only one is relevant to them. Tabs let a visitor self-select the relevant story, cutting reading time and cognitive load — this is the page's required "meaningful interaction," chosen because it directly serves the comparison task, not for novelty. |
| Team presentation | Embedded video (YouTube, `youtube-nocookie.com`) | The judged presentation carries tone, pacing and storytelling context — why the problem mattered, how the team framed the solution — that a text summary flattens. It is also the closest thing to primary evidence available: it's literally the artifact the judges evaluated, not my own retelling of it. |
| Photo gallery | Photographs (event posters, ceremony stills) | Establishes the real-world scale and legitimacy of the events (official organiser branding, live multi-day judging) far more convincingly than a text description of "these were real, judged events" ever could. |

## Critical selection requirement — rejected media element

Two real candidate videos existed for the NASA Space Apps section: the ~4-minute official team presentation (embedded on the page) and a separate, shorter raw feature-demo video of DebMap's interface in action.

**I rejected the shorter demo video from the final page.** Reasoning:

- **Duplication.** The presentation video already narrates and visually demonstrates the DebMap interface as part of pitching it — a second video covering the same interface would repeat content rather than add new information for the visitor.
- **Cognitive load and page weight.** Two embedded video players compound the page's initial weight and ask more of a visitor's limited attention than the "assess this in under two minutes" objective allows. The assignment brief is explicit that more media is not the goal — every element needs a distinct purpose.
- **Resolution, not removal.** Rather than dropping the demo video entirely, it remains available as a plain text link ("Watch the demo video") next to the DebMap panel — reachable by a visitor who specifically wants deeper technical proof, without being forced on everyone who lands on the page.

This mirrors the same reasoning applied to the audio/video requirement more broadly: the goal was one video that does real communicative work, not the maximum number of media elements that could technically be embedded.

# CARVO — Web UI (Phase 1 MVP)

Design prototype for **CARVO**, an AI-powered knowledge, analysis, guidance and accountability platform.
This repository holds the **minister / user flow**, built end-to-end as a clickable prototype.

CARVO is not a chatbot. Its spine is:

> Knowledge → Understanding → Analysis → Guidance → Action → Result → Feedback

The UI is built so that spine is visible on screen: every conclusion carries the source it came from,
and the five kinds of content in an analysis (what the user said, what CARVO observed, where the
knowledge came from, how CARVO interpreted it, what it recommends) never share a visual treatment.

---

## Opening it

**`index.html`** — self-contained. Open it directly in a browser; no server, no build, no network.
Everything (styles, fonts fallback, runtime, design system) is inlined.

**`src/`** — the editable source.
- `carvo-minister.dc.html` — the whole flow (one file: template + logic + sample data, both languages)
- `carvo-brief-a.dc.html` / `carvo-brief-b.dc.html` — the two dashboard directions explored before
  settling on A (one-column editorial) for the shipped flow
- `_ds/` — the Broadsheet design system (stylesheet + component bundle) the pages load
- `support.js` — the component runtime

Serve `src/` over any static server to work on the source (`python3 -m http.server`, then open
`src/carvo-minister.dc.html`).

---

## The flow, screen by screen

| # | Screen | What it does |
|---|---|---|
| 1 | **Login** | Email + password, language switch, demo disclaimer. Sign in → the brief. |
| 2 | **Today's Brief** (dashboard) | The dashboard *is* the daily brief: dateline, a headline framing the day's question, the day-shape graph, three day-parts, `Needs you today`, `Today's calibration` (one act, with its source), `Already settled`, and the day's closing sentence and verse. |
| 3 | **New Analysis** | One large natural-language field (`What is happening?`) plus five optional structured fields and an attachment slot. One-click prefill from any brief item, so the demo closes a loop. |
| 4 | **Processing** | Full-screen takeover. Five steps advance line by line under a thin progress rule — a structured comparison, explicitly not a conversation. |
| 5 | **CARVO Analysis** | The showpiece. Six numbered sections, each with its own visual treatment: `01` what you told CARVO (recessed panel), `02` what CARVO identified (ruled list), `03` relevant knowledge (bordered source block with doc / section / page and **View Source**), `04` CARVO's interpretation (prose against a rule), `05` recommended action (tinted, prominent, with *why* and *expected result*), `06` next step (Accept & Start Action / I Disagree). Closes on the day's sentence. |
| 6 | **My Actions** | Active / Completed / Overdue tabs, progress per action, status progression. Overdue is empty — and shows a useful empty state. |
| 7 | **My Analyses** | History with live search and status filters. Skeleton loading on entry. |
| 8 | **Projects** | Point A → Point B, progress, milestones, last activity. |
| 9 | **Protocols** + detail | Read-only view of the approved knowledge, with the full protocol page (description, when it applies, indicators, what CARVO looks for, recommended response, related protocols, source). |
| 10 | **Notifications / Profile / Settings** | Plus the demo toggles below. |

Cross-cutting: the **source reference** component is reusable and opens a slide-over panel showing the
cited page; toasts confirm state changes; the sidebar collapses to a drawer under 900px.

---

## Demonstration controls

`Settings` carries two switches for showing non-happy paths live:

- **Simulate an analysis failure** — the processing run ends in the error state (`Try Again` / `Report Issue`), no technical detail exposed.
- **Simulate an empty account** — Analyses, Actions and Projects fall back to their empty states.

---

## Language

Fully bilingual **Hebrew (RTL)** and **English (LTR)** — every screen, not just the brief. The switch
sits in the control strip above the app and in Settings. Layout mirrors properly (logical CSS
properties throughout), and the day-shape graph reverses so time still flows in the reading direction.

---

## Design notes

- **Voice.** Built on the client's own "Daily Brief" mockups rather than a generic SaaS template:
  warm paper `#FCFCFB`, near-black ink `#2E2C27`, one clay accent `#C6613F`, serif throughout
  (Source Serif 4 / Frank Ruhl Libre for Hebrew). No cyan, no gradients, no cards used as layout.
- **Structure over chrome.** Hierarchy comes from the serif scale and whitespace. Boxes appear only
  where content is genuinely discrete — the source block, the recommendation, the recessed quote panel.
- **No hardcoded doctrine.** Per the brief's data principle, the frontend hardcodes no protocols,
  scores or rules. All knowledge, protocols, observations and recommendations arrive as data; the UI's
  job is to present them and always show their source. Swapping the sample data changes nothing structural.
- **Sample data** uses an elected official's day and a real Torah portion (Ki Tavo, first Aliyah) as the
  knowledge source, matching the client's examples. Calendar, committee, constituent and media data
  are simulated; the source text is real.

---

## Not in this pass

The admin / knowledge flow (Upload Knowledge → Processing → AI Understanding Review → Clarification →
Knowledge Approval → Protocol Library management) is specified in the brief and not yet built here.
Phase-2 surfaces (elections, citizen portal, monitoring, integrations) are deliberately out of scope.

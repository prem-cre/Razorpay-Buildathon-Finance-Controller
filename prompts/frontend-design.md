# Prompt — Frontend Design & Build

Paste the block below into a fresh chat with a strong coding model (Claude Opus 5, in an agentic coding tool with file write access — Claude Code, Cursor, or similar). It expects to scaffold a real React project, not just describe one.

Before running this, have Layer 1 of the engine producing real JSON output (match results + audit trail + exception list) so the frontend can be wired to real data, not placeholders, before the demo.

---

## THE PROMPT

You are acting as a senior product design engineer — the kind who ships fintech dashboards used by finance teams at scale. You think in the language of information hierarchy, trust signals, and the five-second first impression, not just component libraries. You are building the frontend for a **finance reconciliation agent**, submitted as a project for a buildathon run by an Indian payments company. The evaluators will look at this for roughly 5 minutes total, live, on a shared screen. Your design has to communicate competence and rigor before anyone reads a single number.

---

### PHASE 0 — Deep reasoning (mandatory, write this out before touching code)

Think through, in the open:

1. **What does a finance-ops tool need to feel like to be trusted?** Not "exciting" — *trustworthy*. Contrast this against a typical hackathon UI (gradient hero, big emoji, playful copy) and explain why that register is wrong for this specific product. A reconciliation dashboard should feel like something a CFO would actually let near real bank data.
2. **What is the evaluator's actual viewing pattern?** They will not read every pixel. They will glance, form a judgment in under 5 seconds, then look for exactly two things: a headline number (match rate) and evidence it isn't fake (an exception list, an audit trail, a place where the system admits it doesn't know something). Design the information hierarchy around that scan pattern, not around a linear top-to-bottom story.
3. **What makes AI-generated UIs look AI-generated?** Name the specific tells — purple-to-blue gradient hero sections, generic rounded-everything cards with no hierarchy, emoji as icons, Inter font at default weight with no type scale, drop shadows on everything, centered hero text with a vague tagline, filler stat cards with no real numbers behind them. Commit, explicitly, to avoiding every one of these.
4. **What register should this borrow from?** Not literal Razorpay branding, colors, or wordmarks — that would look derivative and risks trademark issues in a real submission. Instead: the *category conventions* of serious Indian fintech dashboards (Razorpay Dashboard, RazorpayX, Stripe Dashboard, Linear, Mercury Bank) — dense information, restrained color used only for status and meaning, real typographic hierarchy, monospace for IDs/amounts, generous whitespace that comes from restraint, not emptiness. State explicitly: color used for *decoration* is banned; color is only allowed when it encodes a state (matched / exception / pending).
5. **Decide the design system before writing any component.** Lock: a primary neutral palette (near-black text, off-white/paper background, gray borders), a single accent color used sparingly for primary actions and the brand mark only, and a semantic palette for states (success green, warning amber, danger red, info blue) used only on badges/pills/status dots — never as background decoration. Lock a type scale (a real one — 7-9 defined sizes, not "text-sm/md/lg"). Lock spacing on a 4px or 8px grid.

Only after this reasoning is written out, proceed to build.

---

### PHASE 1 — Product context (what this UI actually represents)

This is a **multi-source reconciliation agent**. It ingests three data sources (payment gateway settlements, bank statement, e-commerce order export), runs a three-layer matching engine (deterministic rules → fuzzy matching → LLM-diagnosed exceptions), and produces:
- A match rate (e.g., "94.2% auto-matched")
- A confidence-banded result set (HIGH / MEDIUM / LOW per record)
- An exception list clustered by root cause (timing gaps, chargebacks, duplicates, refunds, unknowns — see the category list below)
- A full audit trail per record: which rule fired, what evidence it used, and (for LLM-diagnosed records) the reasoning
- Optionally, a natural-language Q&A interface over the reconciled batch

Exception categories to design status chips/badges for: `timing_gap`, `fee_discrepancy`, `chargeback_withheld`, `refund_netted`, `partial_refund`, `duplicate_capture`, `split_payment`, `orphan_payment`, `fx_delta`, `amount_unknown`, `noise_ignore`. Each needs a distinct, legible chip — don't just recolor the same pill 11 times; group by severity (auto-resolvable vs. needs-human vs. true-unknown) and let color communicate that grouping, not the individual category.

---

### PHASE 2 — Pages and states to build

#### 1. Upload / Batch Setup
- Three clearly labeled drop zones (Payment Gateway Settlement, Bank Statement, Order Export), each showing accepted format hints and a live preview of row count once a file lands.
- A "Run Reconciliation" primary action, disabled until all three sources are present.
- This page should look like a tool, not a landing page. No hero section, no marketing copy. First thing visible is the task.

#### 2. Processing State
- A real progress indicator that reflects the actual three-layer pipeline (Layer 1: deterministic matching → Layer 2: fuzzy matching → Layer 3: LLM diagnosis of residuals) — not a generic spinner. Show which layer is active and a running count of records resolved so far, ticking up live if the backend streams progress.

#### 3. Dashboard / Batch Overview (the page the evaluator will screenshot)
- **Top band**: 4-5 stat tiles — Total Records, Match Rate (the hero number, largest type on the page), Auto-Resolved, Needs Review, True Unknowns. Numbers should read instantly; use tabular/monospace figures so they align.
- **Confidence breakdown**: a simple horizontal stacked bar or donut showing HIGH / MEDIUM / LOW proportion — restrained, not a rainbow chart.
- **Exception category breakdown**: a sorted horizontal bar list (category name, count, total ₹ impact) — sorted by financial impact descending, not alphabetically. This is the "proof it's not cherry-picked" section — make it prominent, not buried.
- A visible link/tab to the held-out adversarial-set results alongside the main batch — this is your strongest differentiator, don't hide it in a submenu.

#### 4. Reconciliation Table (the main workhorse view)
- Dense data table, one row per record: ID, source(s) matched, amount, confidence badge, status.
- Filters: by confidence band, by exception category, by amount range, by date. Filters should be visibly functional, not decorative.
- Search by ID/reference.
- Sortable columns, especially amount.
- Clicking a row opens the audit trail (drawer or side panel, not a full page navigation — keep context).
- Use monospace font for all IDs, UTRs, and amounts — this is a real fintech-UI convention that instantly reads as "built by someone who's seen real data," not decoration.

#### 5. Record Detail / Audit Trail (drawer or modal)
- Show the evidence trail exactly as the backend produces it: which rule fired (e.g., `R1.1_exact_three_way`), the raw evidence fields it matched on, the confidence score, and — for LLM-diagnosed exceptions — the model's reasoning text and suggested action (`auto_resolvable` / `human_review` / `escalate`).
- This view is your trust-building moment. Make it legible and specific — real field names, real values, not a vague "AI determined this is a match" sentence.

#### 6. Exception Queue
- The unresolved records, grouped by root-cause category (not a flat list — see `docs/exception-taxonomy.md` for the exact clustering logic).
- Each category group is collapsible, shows count + total ₹ impact in the header, and an inline suggested action.
- A distinctly-styled, smaller section at the bottom for `amount_unknown` — the true residual — labeled honestly (something like "Unresolved — needs finance review") rather than hidden or downplayed. This honesty is a deliberate design choice: showing what the system *cannot* do is part of the credibility story.

#### 7. (Optional, if time allows) Settlement Q&A
- A simple chat panel where a user can ask "why was I short ₹X today" and get an answer grounded in the reconciled batch, with inline citations back to specific record IDs (clicking a citation opens that record's audit trail).

---

### PHASE 3 — Interaction and motion

- Motion should communicate *state change*, not decorate. A stat tile updating live, a table row transitioning from "processing" to "matched" — yes. Bouncing icons, parallax, gratuitous hover-lift on every card — no.
- Loading states should be real skeletons shaped like the content they replace, not generic spinners, except during the processing pipeline state where a labeled progress indicator is correct.
- Toasts/confirmations should be minimal and functional (e.g., "Batch reconciled — 94.2% match rate" on completion), not celebratory (no confetti, no "🎉 Success!").
- Every interactive element needs a visible hover/focus state — this is a signal of build quality that evaluators notice even subconsciously.

---

### PHASE 4 — Technical constraints

- Stack: React + TypeScript, Tailwind CSS, a real component primitive library (shadcn/ui or similar — do not hand-roll basic primitives like dropdowns/dialogs from scratch).
- Charts: a lightweight real charting library (Recharts or visx) — no chart-junk, no 3D, no unnecessary legends.
- Font: a real typeface pairing — a clean grotesk/sans for UI text (e.g., Inter, but tune the weight scale deliberately, don't use default 400 everywhere) and a monospace (e.g., JetBrains Mono, IBM Plex Mono) for IDs/amounts/code-like data.
- Fully responsive is not the priority — this will be demoed on a laptop/projector. Optimize for a 1440px-ish viewport looking excellent; graceful degradation elsewhere is enough.
- Light mode only unless time allows dark mode — do not ship a half-finished dark mode toggle that looks worse than no toggle.
- Wire to real backend output (JSON matching the audit-trail and exception-list shapes already defined in the project's `docs/matching-rules.md` and `docs/exception-taxonomy.md`) — do not hardcode fixture data as the final state; fixtures are fine for initial scaffolding only, but the last mile must read real engine output.

---

### PHASE 5 — Anti-checklist (explicitly verify none of these before calling it done)

- [ ] No purple/blue gradient hero anywhere
- [ ] No emoji used as functional icons (a proper icon set — Lucide or Phosphor — throughout)
- [ ] No centered marketing-style hero copy ("Reconcile smarter, not harder ✨")
- [ ] No decorative color — every colored element encodes a real state
- [ ] No placeholder/lorem-ipsum numbers left in the final build
- [ ] No default-Tailwind look (default blue-500 buttons, default gray-100 cards with no custom type scale)
- [ ] The match-rate number is the single largest, most prominent number on the dashboard
- [ ] The exception list is visible without scrolling past the fold on the main dashboard, or is one click away — never buried three levels deep
- [ ] Every record's audit trail is real, specific, and traceable — no vague "AI verified this" copy anywhere

---

### FINAL INSTRUCTION

Build this as a real, running project — not a static mockup. Scaffold the project structure first, confirm the design-system tokens (colors, type scale, spacing) in one central file before building pages, then build page-by-page in the order listed in Phase 2. After each page, briefly state what design decision you made and why, referencing the reasoning from Phase 0 — this keeps the build anchored to the stated design philosophy instead of drifting into generic patterns as the session goes on.

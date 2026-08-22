# Razorpay AI Buildathon — Finance Controller

Multi-source reconciliation agent. Closes the three-way match loop between payment gateway settlements, bank statements, and internal orders.

## Track
Track 04 — AI Finance Controller.

## Deliverable
An agent that reconciles a 50+ record batch across three data sources (Razorpay Settlement CSV, HDFC/ICICI bank statement, Shopify order export), reports a match rate, and produces a root-cause-clustered exception list with a per-record audit trail.

## Architecture (three layers, executed in order)
1. **Deterministic matching** — exact UTR, amount, and reference links. Handles 85-90% of records at HIGH confidence.
2. **Fuzzy matching** — UTR variants, split payments, fee-adjusted deltas. Handles residual 5-8% at MEDIUM confidence.
3. **LLM diagnosis** — only for what Layers 1-2 cannot resolve. Classifies into the exception taxonomy, produces root-cause reasoning, suggests action.

## Structure
- `docs/` — schemas, matching rules, exception taxonomy
  - `schema.md` — record shapes for all three data sources
  - `matching-rules.md` — priority-ordered matching logic
  - `exception-taxonomy.md` — enumerated exception categories
- `data/` — synthetic datasets
  - `clean/` — 100% matchable baseline
  - `messy/` — realistic mix with injected defects
  - `adversarial/` — held-out harder cases
- `src/` — implementation
  - `generator/` — synthetic data generation (may be code, or LLM-produced)
  - `engine/` — three-layer matching engine
  - `ui/` — reconciliation UI
- `prompts/` — LLM prompts used (data generation, exception diagnosis, Q&A)
- `outputs/` — metrics, exception lists, journal-entry exports


## Key metric
Match rate on the messy dataset + precision/recall on the adversarial (held-out) dataset. Reported alongside honest residual exception count and per-category false-positive cost.

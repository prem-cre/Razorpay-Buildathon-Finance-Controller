# Layer 2 — Fuzzy & Recovery Results

Layer 2 runs only on payments Layer 1 left `unresolved`. It never overturns a
Layer 1 decision. Reproduce:

```bash
python -m src.engine.run --dataset all --strict-clean
python -m src.tests.test_layer1
```

## Headline (layered engine, L1 + L2)

| Dataset | Resolution rate | L1 | L2 recovered | Safety precision | Dangerous auto-resolutions |
|---|---|---|---|---|---|
| clean | 100.0% | 55 | 0 | 100% | 0 |
| messy | **59.0%** (was 20.5%) | 17 | **32** | 100% | 0 |
| adversarial (held-out) | 71.7% | 41 | 2 | 100% | 0 |

Layer 2 nearly tripled resolution on the realistic messy batch — and did it
without a single dangerous auto-resolution.

## The metric that matters: safety precision

The brief asks for the match rate and *"the exceptions it could not resolve."*
So categories split into two dispositions:

- **RESOLVABLE** (`matched`, `split_payment`, `refund_netted`, `partial_refund`,
  `timing_gap`, `fee_discrepancy`) — the money genuinely landed once the pattern
  is understood; a correct engine may auto-resolve these.
- **ESCALATE** (`chargeback_withheld`, `duplicate_capture`, `orphan_payment`,
  `fx_delta`, `amount_unknown`) — money is withheld / ambiguous / unknown; these
  must be surfaced, never auto-matched.

**Safety precision** = of everything the engine auto-resolved, the fraction that
was *not* an ESCALATE category. Auto-resolving an ESCALATE record is the only
truly dangerous error (you close the books on money that is actually at risk).
Layer 2 keeps this at **100%** on all three datasets — including the held-out
adversarial set it was never tuned against.

## The rules

- **R2.1 — Fuzzy UTR bank link.** Settlement UTR absent from the bank verbatim
  but present within Levenshtein distance ≤ 2 (OCR / typo). Re-link, then match.
- **R2.2 — Partial reference link.** The order's `payment_reference` is a
  truncated prefix of the real `payment_id` (≥ 10 chars). Re-link, then match.
- **R2.3 — Split-payment reconstruction.** Several payments share an `order_id`
  and their gross sums to the order total → reconstruct and match the group.
  (Duplicate captures sum to *twice* the order total, so they are not swept in.)
- **R2.4 — Refund-netted residual.** The single biggest recall lever. A
  settlement batch fails Layer 1's aggregate only because a refund was netted
  from the bank credit. Recover the refund amount from the order's refunded
  field, subtract its *fee-adjusted* bank impact (`refund − fee − GST`), and if
  the batch then reconciles, release the batch's clean siblings — each still
  guarded by a per-payment fee check, so a fee-drift record is never released as
  clean; it stays flagged. This is what recovered 30 batch-poisoned clean
  payments on the messy set.

## Why messy isn't higher (honest)

The remaining messy exceptions are genuinely hard: batches carrying a
chargeback (money actually withheld), a duplicate capture (needs human
confirmation), or an orphan payment (no order at all). Layer 1+2 correctly
**flag** these rather than guess — that is the honest exception list the brief
asks for. Resolving them (chargeback dispute lookup, duplicate detection,
FX-rate application) is Layer 3's job.

## Confidence

Layer 1 matches are **HIGH** (deterministic exact). Layer 2 recoveries are
**MEDIUM** — deterministic evidence, but a recovery inference — so a reviewer
can still choose to spot-check them.

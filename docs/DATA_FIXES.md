# Data Fixes — audit log

Every modification to generated data is recorded here with root cause, fix, and
reproduction command. Nothing is hand-edited silently.

---

## FIX-001 — clean dataset: bank UTRs not aligned to settlement UTRs

**Found:** 2026-08-23, during the Layer 1 clean-baseline run.

**Symptom:** Clean baseline scored 0% match rate. R1.1 rejected all 55 payments.

**Root cause:** In `data/clean/hdfc_bank_statement.csv`, the narration UTRs were
generated independently of `data/clean/razorpay_settlements.csv`, so
`settlement.utr` appeared in **0 of 5** bank narrations. The settlement↔bank
link only survived by amount. This contradicts `docs/schema.md` (UTR is the
bank-matching key) and is inconsistent with the other two datasets, which were
generated correctly:

| Dataset | settlement.utr found in bank narration |
|---|---|
| clean (before fix) | 0 / 5 |
| messy | 5 / 5 |
| adversarial | 3 / 4 (4th is an intentional typo defect) |

So `clean` was the defective outlier. The engine was correct to reject it —
R1.1 requires an exact UTR match, and there was none.

**Decision:** Do **not** weaken R1.1 to tolerate missing UTRs (that would
corrupt the deterministic baseline and defeat its purpose). Instead repair the
clean data so it genuinely follows the UTR-key convention the schema defines and
the other datasets already honor.

**Fix:** `src/generator/repair_clean_utrs.py`. Each clean settlement amount is
unique and equals exactly one bank credit's deposit, so the settlement↔bank
pairing is unambiguous by amount. The script uses that amount link to rewrite
each bank credit row's narration UTR and `Chq/Ref No` to the matching
`settlement.utr`. No amounts, dates, balances, or non-credit (noise) rows are
touched. The script is idempotent — running it again is a no-op.

**Reproduce:**
```bash
python -m src.generator.repair_clean_utrs
```

**Result:** 5 bank credit rows rewritten. Clean baseline then scored **100%
matched, 0 exceptions, 0 false positives**, all via R1.1.

**Note for the panel:** this is deliberately left in the history rather than
hidden. The engine caught a data defect its own baseline was designed to catch;
the fix is scripted, reproducible, and scoped. That is the reconciliation
discipline the whole project is arguing for.

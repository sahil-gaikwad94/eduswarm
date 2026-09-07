# Agent evaluation fixture

The pilot pipeline must publish only when `verification.status` is `approved`, includes two or more trusted sources, and reports non-zero claim coverage. CI uses the deterministic provider so this gate is reproducible; future model providers should be evaluated against a held-out answer key before enabling them in production.

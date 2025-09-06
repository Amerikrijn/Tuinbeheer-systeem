# Agent: Orchestrator
## Doel
- Leid taken door SPEC → TECH → IMPL → TEST → SEC → PERF → DOCS → READY → RELEASE.
- Pauzeer na elk stadium; wacht op approval in `.agent/approvals.yml`.
- Reuse: lees README.md, docs/*, github/docs/* voor eisen/policies en verwijs ernaar in deliverables.

## Stages
- SPEC → docs/specs/<feature>.md met doel, scope, user flows, acceptatiecriteria, verwijzingen naar docs.
- TECH → docs/design/<feature>.md met architectuur, migraties, risico’s; update docs/risk-log.md.
- IMPL → FeatureBuilder implementeert increment + unit tests, achter feature-flag.
- TEST → TestEngineer schrijft extra tests; verslag in docs/reports/<feature>-test.md.
- SEC → SecOps draait scans of audit; verslag in docs/reports/<feature>-sec.md; kleine fixes als aparte commit.
- PERF → PerfAgent draait perf-scripts (perf/targets.json + perf/thresholds.json of voorstel); verslag in docs/reports/<feature>-perf.md.
- DOCS → DocsWriter werkt README/CHANGELOG/API bij.
- READY → PR uit draft; klaar voor review.

## READY → RELEASE
- Als alle stages approved:
  1) Zet PR status “Ready for review”.
  2) Na merge:
     - Lees .agent/release.yml en CHANGELOG.md.
     - Bepaal nieuwe semver (minor/patch).
     - Maak GitHub release:
       * Tag: v<semver>
       * Title: Release v<semver>
       * Body: changelog + links naar SPEC/TECH/SEC/PERF docs.
     - Uitvoeren via gh CLI of REST API met GITHUB_TOKEN.
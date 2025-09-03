# *Commands
## @pipeline-start
Orchestrator: maak feature-branch, initialiseer SPEC, open DRAFT PR en pauzeer tot approval in `.agent/approvals.yml`.
## @pipeline-continue
Orchestrator: lees `.agent/approvals.yml` en voer volgende stadium uit tot volgende pause.
## @pipeline-status
Orchestrator: toon huidige pipeline status en progress.
## @pipeline-reset
Orchestrator: reset pipeline naar begin of specifieke stage.
## Agent Commands
### @spec-agent
SPEC Agent: start business analysis en requirement specification.
### @tech-agent
TECH Agent: start architectuur validatie en technical design.
### @impl-agent
IMPL Agent: start code implementatie en banking standards testing.
### @test-agent
TEST Agent: start comprehensive testing volgens banking standards.
### @sec-agent
SEC Agent: start security audit en vulnerability scanning.
### @perf-agent
PERF Agent: start performance testing en optimization.
### @docs-agent
DOCS Agent: start documentatie update en test aanvulling.
### @ready-agent
READY Agent: start finale validatie en deployment preparation.
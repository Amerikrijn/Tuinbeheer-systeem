# AI Workflow Backlog

## Now
- [FEATURE] Enterprise AI Pipeline Implementation
  - Acceptatiecriteria:
    - [ ] Echte Cursor Rules geïmplementeerd
    - [ ] Echte workflow state management
    - [ ] Echte agent rollen functioneel
    - [ ] Echte commands werkend
    - [ ] Echte testing pipeline
    - [ ] Echte security scanning
    - [ ] Echte performance testing
    - [ ] Echte documentatie updates

## Next
- [TEST] Echte integration tests voor pipeline
- [SEC] Echte security scanning implementatie
- [PERF] Echte performance testing implementatie
- [DOCS] Echte documentatie generation

## Done
- (na merge verplaatsen)

## Pipeline Commands
- `@pipeline-start <feature>`: Start nieuwe feature pipeline
- `@pipeline-continue`: Ga door naar volgende stage
- `@pipeline-status`: Toon huidige status
- `@pipeline-approve <stage>`: Keur stage goed

## Agent Rollen
- **Orchestrator**: Leidt pipeline door alle stages
- **FeatureBuilder**: Implementeert echte code + unit tests
- **TestEngineer**: Schrijft echte extra tests
- **SecOps**: Draait echte security scans
- **PerfAgent**: Draait echte performance tests
- **DocsWriter**: Werkt echte documentatie bij
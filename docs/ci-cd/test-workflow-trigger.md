# Test Workflow Dependencies

Dit bestand test of de nieuwe workflow dependencies correct werken:

1. AI Testing Pipeline wacht op CI/CD Pipeline
2. Deploy wacht op beide flows
3. Preview vereist jouw goedkeuring

## Test Details
- Workflow: `ai-testing-simple.yml`
- Dependencies: `workflow_run` op "CI/CD Pipeline"
- Deploy: wacht op beide flows
- Preview: handmatige goedkeuring vereist

Laten we dit testen! 🚀
# 🎯 Enterprise Pipeline Commands

## 🚀 Pipeline Control Commands

### @pipeline-start
**Orchestrator:** Start nieuwe enterprise feature pipeline
**Acties:**
1. Maak feature-branch: `agent/feature-<feature-name>`
2. Initialiseer SPEC stage in `docs/planning/<feature>-spec.md`
3. Open DRAFT PR: `feat: <feature-name> (enterprise pipeline)`
4. Pauzeer tot approval in `.agent/approvals.yml`

**Gebruik:**
```
@pipeline-start plantvak-optimization
```

### @pipeline-continue
**Orchestrator:** Voer volgende pipeline stage uit
**Acties:**
1. Lees `.agent/approvals.yml` voor huidige status
2. Voer volgende stage uit (TECH → IMPL → TEST → SEC → PERF → DOCS → READY)
3. Pauzeer tot volgende approval

**Gebruik:**
```
@pipeline-continue
```

### @pipeline-status
**Orchestrator:** Toon huidige pipeline status
**Acties:**
1. Lees `.agent/approvals.yml`
2. Toon progressie van alle stages
3. Toon volgende actie vereist

**Gebruik:**
```
@pipeline-status
```

### @pipeline-reset
**Orchestrator:** Reset pipeline naar begin
**Acties:**
1. Reset `.agent/approvals.yml` naar initial state
2. Behoud bestaande documentatie
3. Start opnieuw vanaf SPEC stage

**Gebruik:**
```
@pipeline-reset
```

## 🏗️ Feature Development Commands

### @feature-implement
**FeatureBuilder:** Implementeer feature volgens enterprise standards
**Acties:**
1. Lees tech design uit `docs/architecture/<feature>-design.md`
2. Implementeer volgens Clean Code en SOLID principles
3. Schrijf unit tests (80% coverage)
4. Update code documentation
5. Pauzeer voor code review

**Gebruik:**
```
@feature-implement plantvak-optimization
```

### @feature-optimize
**FeatureBuilder:** Optimaliseer bestaande feature
**Acties:**
1. Analyseer huidige implementatie
2. Identificeer optimization opportunities
3. Implementeer performance improvements
4. Update tests en documentatie

**Gebruik:**
```
@feature-optimize plantvak-optimization
```

## 🧪 Testing Commands

### @test-comprehensive
**TestEngineer:** Voer comprehensive testing uit
**Acties:**
1. Schrijf unit tests (80% coverage)
2. Voer integration tests uit
3. Voer security tests uit
4. Voer performance tests uit
5. Genereer test rapport in `docs/reports/<feature>-test.md`

**Gebruik:**
```
@test-comprehensive plantvak-optimization
```

### @test-security
**TestEngineer:** Voer security testing uit
**Acties:**
1. OWASP Top 10 compliance testing
2. Authentication en authorization testing
3. Input validation testing
4. Vulnerability scanning
5. Genereer security test rapport

**Gebruik:**
```
@test-security plantvak-optimization
```

### @test-performance
**TestEngineer:** Voer performance testing uit
**Acties:**
1. Load testing
2. Stress testing
3. Database performance testing
4. Supabase optimization testing
5. Genereer performance test rapport

**Gebruik:**
```
@test-performance plantvak-optimization
```

## 🔒 Security Commands

### @security-audit
**SecOps:** Voer comprehensive security audit uit
**Acties:**
1. SAST (Static Application Security Testing)
2. DAST (Dynamic Application Security Testing)
3. Dependency vulnerability scanning
4. OWASP Top 10 compliance check
5. Banking standards compliance validation
6. Genereer security rapport in `docs/reports/<feature>-sec.md`

**Gebruik:**
```
@security-audit plantvak-optimization
```

### @security-scan
**SecOps:** Voer security scan uit
**Acties:**
1. Code security pattern analysis
2. Dependency vulnerability scan
3. Configuration security check
4. Generate security findings report

**Gebruik:**
```
@security-scan
```

### @security-compliance
**SecOps:** Check banking compliance
**Acties:**
1. Banking standards compliance check
2. Audit logging validation
3. Data protection compliance
4. Generate compliance report

**Gebruik:**
```
@security-compliance
```

## ⚡ Performance Commands

### @perf-analyze
**PerfAgent:** Analyseer performance van feature
**Acties:**
1. Load testing
2. Stress testing
3. Database performance analysis
4. Supabase connection optimization
5. Bundle size analysis
6. Core Web Vitals measurement
7. Genereer performance rapport in `docs/reports/<feature>-perf.md`

**Gebruik:**
```
@perf-analyze plantvak-optimization
```

### @perf-optimize
**PerfAgent:** Optimaliseer performance
**Acties:**
1. Database query optimization
2. Supabase performance tuning
3. Frontend performance optimization
4. Caching strategy implementation
5. Bundle optimization

**Gebruik:**
```
@perf-optimize plantvak-optimization
```

### @perf-monitor
**PerfAgent:** Setup performance monitoring
**Acties:**
1. Real-time performance monitoring
2. Alert configuration
3. Performance dashboard setup
4. Baseline establishment

**Gebruik:**
```
@perf-monitor
```

## 📚 Documentation Commands

### @docs-update
**DocsWriter:** Update alle documentatie
**Acties:**
1. Update API documentation
2. Update user documentation
3. Update technical documentation
4. Update architecture documentation
5. Update changelog

**Gebruik:**
```
@docs-update plantvak-optimization
```

### @docs-api
**DocsWriter:** Update API documentation
**Acties:**
1. Generate OpenAPI specification
2. Update endpoint documentation
3. Generate code examples
4. Update error documentation

**Gebruik:**
```
@docs-api
```

### @docs-user
**DocsWriter:** Update user documentation
**Acties:**
1. Update user guides
2. Update tutorials
3. Update troubleshooting guides
4. Update FAQ

**Gebruik:**
```
@docs-user
```

## 🔄 CI/CD Integration Commands

### @pipeline-banking-test
**TestEngineer:** Voer banking compliance tests uit
**Acties:**
1. Voer bestaande banking-tests.yml uit
2. Check 80% code coverage
3. Validate security compliance
4. Check performance targets
5. Integreer met bestaande CI/CD

**Gebruik:**
```
@pipeline-banking-test
```

### @pipeline-security-scan
**SecOps:** Voer security scan uit via CI/CD
**Acties:**
1. Voer bestaande security patterns uit
2. Check OWASP compliance
3. Validate banking standards
4. Integreer met bestaande security workflow

**Gebruik:**
```
@pipeline-security-scan
```

### @pipeline-preview-deploy
**Orchestrator:** Trigger preview deployment
**Acties:**
1. Check alle quality gates
2. Trigger Vercel preview deployment
3. Validate deployment health
4. Update deployment status

**Gebruik:**
```
@pipeline-preview-deploy
```

## 🚨 Emergency Commands

### @pipeline-emergency-stop
**Orchestrator:** Stop pipeline in emergency
**Acties:**
1. Stop alle running processes
2. Rollback naar laatste stable state
3. Notify stakeholders
4. Create incident report

**Gebruik:**
```
@pipeline-emergency-stop
```

### @pipeline-rollback
**Orchestrator:** Rollback naar vorige versie
**Acties:**
1. Rollback code changes
2. Rollback database changes
3. Rollback configuration changes
4. Validate rollback success

**Gebruik:**
```
@pipeline-rollback
```

## 📊 Reporting Commands

### @pipeline-report
**Orchestrator:** Genereer comprehensive pipeline rapport
**Acties:**
1. Collect alle stage results
2. Genereer executive summary
3. Create detailed analysis
4. Generate recommendations

**Gebruik:**
```
@pipeline-report
```

### @pipeline-metrics
**Orchestrator:** Toon pipeline metrics
**Acties:**
1. Show completion rates
2. Show quality metrics
3. Show performance metrics
4. Show security metrics

**Gebruik:**
```
@pipeline-metrics
```

## 🎯 Quality Gate Commands

### @quality-gate-check
**Orchestrator:** Check alle quality gates
**Acties:**
1. Check code coverage (80%)
2. Check security compliance
3. Check performance targets
4. Check documentation completeness
5. Generate quality report

**Gebruik:**
```
@quality-gate-check
```

### @quality-gate-override
**Orchestrator:** Override quality gate (emergency only)
**Acties:**
1. Log override reason
2. Require approval
3. Continue pipeline
4. Flag for review

**Gebruik:**
```
@quality-gate-override "Emergency fix for critical bug"
```

## 🔧 Maintenance Commands

### @pipeline-cleanup
**Orchestrator:** Cleanup pipeline artifacts
**Acties:**
1. Remove temporary files
2. Cleanup test data
3. Archive old reports
4. Optimize storage

**Gebruik:**
```
@pipeline-cleanup
```

### @pipeline-update
**Orchestrator:** Update pipeline configuration
**Acties:**
1. Update pipeline rules
2. Update quality gates
3. Update documentation
4. Validate configuration

**Gebruik:**
```
@pipeline-update
```

## 📋 Usage Examples

### Complete Feature Development
```bash
# Start pipeline
@pipeline-start plantvak-optimization

# Continue through stages (after approvals)
@pipeline-continue
@pipeline-continue
@pipeline-continue

# Check status
@pipeline-status

# Generate final report
@pipeline-report
```

### Security Focused Development
```bash
# Start with security focus
@pipeline-start secure-user-management

# Implement with security emphasis
@feature-implement secure-user-management

# Comprehensive security testing
@security-audit secure-user-management
@test-security secure-user-management

# Continue pipeline
@pipeline-continue
```

### Performance Critical Feature
```bash
# Start performance-focused feature
@pipeline-start high-performance-search

# Implement with performance focus
@feature-implement high-performance-search

# Performance analysis and optimization
@perf-analyze high-performance-search
@perf-optimize high-performance-search

# Continue pipeline
@pipeline-continue
```

## 🚨 Quality Gates
- [ ] **Command Validation:** All commands properly validated
- [ ] **Error Handling:** Comprehensive error handling for all commands
- [ ] **Documentation:** Complete command documentation
- [ ] **Testing:** All commands tested and validated
- [ ] **Security:** Commands follow security best practices
- [ ] **Performance:** Commands optimized for performance
- [ ] **Integration:** Commands integrate with existing CI/CD
- [ ] **Monitoring:** Command execution monitoring and logging

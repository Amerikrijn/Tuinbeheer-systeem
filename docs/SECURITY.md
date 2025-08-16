# Security Scanning

This project includes a simple Dynamic Application Security Testing (DAST) stage to catch runtime vulnerabilities before deployment.

## Running locally

```bash
npm run build
npm start &
./scripts/dast-scan.sh http://localhost:3000
```

The script uses the OWASP ZAP baseline scan. Results are written to `dast-report/`. The scan fails if any *critical* (`riskcode` 3) alerts are found.

## Continuous Integration

The GitHub Actions workflow defines a `dast` job that:

1. Builds and starts the application.
2. Executes `scripts/dast-scan.sh`.
3. Fails the pipeline on critical findings.

The job runs after the build stage and is required for preview and production deployments.

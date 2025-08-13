# 🧪 Teststrategie

## Doelen
- Regressies voorkomen, security‑kritische paden borgen, coverage ≥ 80%

## Testniveaus
- Unit: pure functies, services (`lib/**`, helpers)
- Component: UI met Testing Library (`components/**`)
- Integratie: API‑routes en flowspaden (`app/api/**`)

## Richtlijnen
- Arrange‑Act‑Assert patroon
- Mock externe diensten (Supabase) in unit/component tests
- Geen afhankelijkheid van echte env secrets in tests
- Edge cases + foutafhandeling verplicht

## Commands
- Unit: `npm run test:unit`
- Integratie: `npm run test:integration`
- CI: `npm run test:ci`

## Coverage
- Threshold staat in `jest.config.js` (80% voor alle categorieën)

## Pull Requests
- Nieuwe/gewijzigde code: passende tests
- Falen op coverage of lints blokkeert merge
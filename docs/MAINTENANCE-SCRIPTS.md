# Onderhoudscripts

De map `scripts/` bevat hulpscripts voor handmatige opschoontaken. Ze draaien **niet** automatisch in de pipeline. Gebruik ze alleen wanneer nodig en voer daarna altijd de tests uit.

## Beschikbare scripts

- **`fix-all-syntax-final.sh`** – scant TypeScript-bestanden op `NODE_ENV`-blocks en verwijdert resterende console-statements of dubbele checks.
- **`fix-double-conditionals.sh`** – verwijdert dubbele `NODE_ENV === "development"`-condities.
- **`fix-closing-braces.sh`** – controleert op ontbrekende sluitaccolades bij conditionele console-statements.
- **`fix-console-logging.sh`** – maakt console-statements afhankelijk van `NODE_ENV`.
- **`remove-console.sh`** – verwijdert console-statements uit `lib/database.ts`.
- **`remove-all-console.sh`** – verwijdert alle console-statements in de codebase.

## Gebruik

Voer een script uit vanuit de projectroot:

```bash
./scripts/fix-all-syntax-final.sh
```

Vervang de bestandsnaam door het gewenste script. Voer na afloop altijd `npm test` uit.

# SPEC: Verbetering plant-invoer – verplichte bloeiperiode (UX + data)

## Context
- Huidige situatie in `components/ui/plant-form.tsx`:
  - "Bloeiperiode" wordt als vrij tekstveld getoond onder "Planning & Status" en is optioneel.
  - De UI gebruikt het veld `expectedHarvestDate` als label "Bloeiperiode", wat verwarrend is.
- Data-laag ondersteunt al `bloom_period?: string` op `plants` (`lib/types/index.ts`, `lib/database.ts`).
- Weergave en filtering (o.a. `components/garden/plant-bed-summary.tsx`) verwachten een string als maand-bereik, bijv. "September-Oktober" of "sep-okt" (case-insensitive).

## Doel
- Maak bloeiperiode verplicht en verplaats deze naar het blok met verplichte velden.
- Maak invoer eenduidig: kies start- en eindmaand via duidelijke UI, en sla op als één string `Startmaand-Eindmaand` (bijv. "September-Oktober").
- Correcte datamapping: gebruik `bloom_period` in de database, niet `expected_harvest_date`.
- Consistente look & feel tussen “Nieuwe plant” en “Bewerken”.

## Scope
- UI-component: `components/ui/plant-form.tsx`
- Pagina’s:
  - `app/gardens/[id]/plant-beds/[bedId]/plants/new/page.tsx`
  - `app/gardens/[id]/plant-beds/[bedId]/plants/[plantId]/edit/page.tsx`
- Data mapping: `lib/database.ts` (create/updatePlant calls)

## UX Wijzigingen
1) Verplicht veld “Bloeiperiode” toevoegen aan de sectie “Basis Plantgegevens” (verplicht-blok), direct in dit blok boven de inklapbare sectie.
2) Vervang vrij tekstveld door 2 duidelijke selecties (gekozen optie 1):
   - Select “Startmaand” (Jan..Dec)
   - Select “Eindmaand” (Jan..Dec)
   - Toon inline hint: “Opslag als: Startmaand-Eindmaand (bijv. September-Oktober)”
3) Bij submit: vorm één string `Startmaand-Eindmaand` en valideer:
   - Beide maanden gekozen
   - Formaat correct
4) Verplaats het huidige tekstveld uit “Planning & Status” en verwijder de verwarrende label-koppeling met `expectedHarvestDate`.
5) Consistentie create/edit:
   - Beide pagina’s renderen dezelfde `PlantForm` met identieke props en layout.
   - Edit vult start/eindmaand vooraf in op basis van bestaande `bloom_period`.

## Datamodellering en Mapping
- Database: bestaand veld `plants.bloom_period` (string) blijven gebruiken.
- UI state in `PlantForm`:
  - Introduceer `bloomPeriod` (string) als canonical UI-waarde
  - Introduceer `bloomStartMonth` en `bloomEndMonth` (optioneel intern voor de selects)
  - Verwijder afhankelijkheid van `expectedHarvestDate` voor bloeiperiode
- Create (new plant):
  - `createPlant({ ..., bloom_period: plantData.bloomPeriod, ... })`
- Update (edit plant):
  - `updatePlant(id, { ..., bloom_period: plantData.bloomPeriod, ... })`

## Validatie
- Bloeiperiode is verplicht:
  - UI: disable submit als `bloomPeriod` leeg of ongeldig is
  - Parse/validatie bij submit: start- en eindmaand aanwezig
  - Acceptatie van bestaande waarden blijft; nieuwe UI schrijft altijd in `Voluit-Voluit` formaat (bijv. “September-Oktober”)

## Compatibiliteit met bestaande logica
- `parseMonthRange` in `components/garden/plant-bed-summary.tsx` ondersteunt voluit en afkorting; we kiezen standaard voluit (bijv. “September-Oktober”) voor consistentie.
- Bestaande planten met afkortingen blijven werken (lowercase map ondersteunt “sep-okt”).

## Edge cases
- Start == Eind: toegestaan, betekent bloei in één maand (bijv. “September-September”).
- Jaargrens (bijv. “November-Februari”) ondersteunt wrap-around; `parseMonthRange` hanteert dit via progressieve lijst op basis van start→eind.

## Acceptatiecriteria
- Verplicht veld “Bloeiperiode” zichtbaar en gemarkeerd als verplicht in het verplichte-velden-blok.
- Nieuwe plant aanmaken faalt netjes zonder start/eindmaand; bij correct invullen wordt `plants.bloom_period` gezet.
- Bestaande plant bewerken toont bestaande periode correct in de selects en slaat updates op.
- Overzichts- en filtercomponenten tonen en gebruiken de nieuwe waarde zonder regressies.
- Create en Edit hebben consistente look & feel (zelfde card-styling, headers, spacing).

## QA & Tests (te implementeren in @test-agent fase)
- Unit tests: mapping van UI → `bloom_period` en validatie.
- Integration tests: create en edit flow met “bloom required”.
- Snapshot/visual checks: consistentie create vs edit.

## Implementatie-aanpak (hoog-over)
1) `PlantForm` uitbreiden:
   - Nieuwe velden `bloomStartMonth`, `bloomEndMonth`, `bloomPeriod` in `PlantFormData`.
   - Maand-selects + formatter naar `bloomPeriod`.
   - Verplicht-velden blok: verplaats “Bloeiperiode”.
2) `new/edit` pagina’s aanpassen:
   - Create: doorgeven naar `createPlant` met `bloom_period`.
   - Edit: initialiseren vanuit `plant.bloom_period`, doorgeven naar `updatePlant`.
3) Validate & fallback:
   - Bij init: parse bestaande `bloom_period` naar start/eind select.
   - Bij submit: samenstellen valide string.

## Non-goals
- Geen database migraties; veld bestaat al.
- Geen verandering aan bestaande parse-functies buiten noodzakelijke fixes.



# 📘 Gebruikershandleiding

## Overzicht
Deze handleiding beschrijft hoe je het Tuinbeheer Systeem gebruikt: inloggen, tuinen beheren, plantvakken en planten beheren, taken en logboek, én admins die gebruikers beheren.

## Inloggen en account
- Ga naar `/auth/login`
- Log in met je e‑mail en wachtwoord
- Wachtwoord vergeten? Gebruik `/auth/forgot-password`
- Uitnodiging ontvangen? Volg de link naar `/auth/accept-invitation`

## Dashboard
- Startpagina toont recente activiteiten en toegang tot je tuinen
- Navigatie: `Tuinen`, `Taken`, `Logboek`, `Admin` (alleen voor admins)

## Tuinen
- Overzicht: `/`
- Nieuwe tuin: `Tuinen` → `+ Nieuwe tuin`
- Detail: `Tuin` → `Plantvakken` en `Instellingen`

## Plantvakken (visual garden designer)
- Ga naar een tuin → `Plantvakken`
- Sleep en schaal plantvakken; gebruik raster en snap‑to‑grid
- Posities worden opgeslagen via server‑API

## Planten
- In plantvakdetail: `+ Nieuwe plant`
- Eigenschappen: naam, kleur, hoogte, bloei, notities, emoji
- Statussen: `gezond`, `aandacht_nodig`, `ziek`, `dood`, `geoogst`

## Taken
- Wekelijkse takenlijst met status
- Filter op tuin/plantvak

## Logboek
- Activiteiten registreren met tekst en (optioneel) foto
- Detailpagina per logboekitem

## Profiel en beveiliging
- Wachtwoord wijzigen via `/auth/change-password`
- Bij admin reset: verplichte wijziging na inloggen

## Admin gebruikersbeheer (alleen admin)
- Locatie: `/admin/users`
- Functies: uitnodigen, herinnering sturen, status/rol wijzigen, wachtwoord resetten, gebruiker verwijderen
- Zie ook `ADMIN_GEBRUIKERSBEHEER_GIDS.md` voor uitgebreide admin-instructies

## Toegangscontrole
- Alleen eigen data zichtbaar tenzij adminrechten
- Pogingen zonder rechten worden geblokkeerd en gelogd

## Support
- Problemen met login of rechten: neem contact op met de admin
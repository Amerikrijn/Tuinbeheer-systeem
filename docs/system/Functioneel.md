# 📙 Functionele beschrijving

## Doelgroepen
- Gebruikers: beheren van tuinen, plantvakken, planten, taken en logboek
- Admins: gebruikersbeheer, rollen en status

## Hoofdfuncties
- Tuinen: CRUD, visual canvas instellingen (grid, zoom, achtergrond)
- Plantvakken: positie, rotatie, formaat, kleurcode, z‑index
- Planten: eigenschappen, status, notities, emoji
- Taken: wekelijkse lijst per tuin/plantvak
- Logboek: activiteiten met media
- Authenticatie: login, uitnodiging, wachtwoord vergeten/reset
- Admin: uitnodigen, status/rol wijzigen, resetten/verwijderen

## Belangrijke regels
- Alleen geautoriseerde acties; RLS policies beschermen privacy
- Adminacties via server‑API met audit logging

## Flows (samengevat)
- Nieuwe gebruiker: admin nodigt uit → acceptatie → eerste login → eventueel wachtwoordwijziging
- Plantvak verplaatsen: UI drag → validatie → opslaan via server‑API → RLS/constraints waarborgen
- Wachtwoord reset: admin zet tijdelijk wachtwoord + force change → gebruiker wijzigt na login
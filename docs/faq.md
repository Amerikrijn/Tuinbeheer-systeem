# FAQ - Tuinbeheer Systeem

## 🤔 Veelgestelde Vragen

### Algemeen

#### Q: Wat is het Tuinbeheer Systeem?
**A:** Het Tuinbeheer Systeem is een webapplicatie voor het professioneel beheren van tuinen, plantvakken en planten. Het biedt een visuele drag-and-drop interface voor tuinontwerp en uitgebreid beheer van plantgegevens.

#### Q: Voor wie is dit systeem bedoeld?
**A:** Het systeem is geschikt voor:
- Particuliere tuinliefhebbers
- Tuincentra en kwekerijen
- Landschapsarchitecten
- Hoveniers en tuinonderhoudsbedrijven
- Educatieve instellingen

#### Q: Wat zijn de hoofdfuncties?
**A:** 
- **Tuinbeheer**: Aanmaken en beheren van meerdere tuinen
- **Plantvak Management**: Visuele indeling van tuinen in plantvakken
- **Plantenbeheer**: Uitgebreid beheer van individuele planten
- **Visuele Designer**: Drag-and-drop interface voor tuinontwerp
- **Takenbeheer**: Planning en tracking van onderhoudstaken
- **Nederlandse Bloemen Database**: Uitgebreide database met Nederlandse planten

---

## 💻 Technische Vragen

### Installatie en Setup

#### Q: Welke systeemvereisten zijn er?
**A:** 
- **Node.js**: Versie 18 of hoger
- **Browser**: Moderne browser (Chrome, Firefox, Safari, Edge)
- **Internet**: Stabiele internetverbinding voor Supabase
- **Geheugen**: Minimaal 4GB RAM aanbevolen

#### Q: Hoe installeer ik het systeem lokaal?
**A:** 
```bash
# 1. Clone het project
git clone <repository-url>
cd tuinbeheer-systeem

# 2. Installeer dependencies
npm install

# 3. Configureer environment
cp .env.example .env.local
# Vul je Supabase credentials in

# 4. Setup database
npm run db:setup

# 5. Start development server
npm run dev
```

#### Q: Hoe krijg ik Supabase credentials?
**A:** 
1. Ga naar [supabase.com](https://supabase.com)
2. Maak een account aan
3. Maak een nieuw project
4. Ga naar Settings → API
5. Kopieer de URL en anon key naar je `.env.local`

#### Q: Wat doe ik als de database setup faalt?
**A:** 
```bash
# Check je environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Reset en probeer opnieuw
npm run db:reset
npm run db:setup

# Check Supabase dashboard voor errors
```

### Database

#### Q: Kan ik mijn eigen database gebruiken?
**A:** Het systeem is specifiek ontworpen voor Supabase (PostgreSQL). Voor andere databases zou je de database layer moeten aanpassen in `lib/supabase.ts` en `lib/database.ts`.

#### Q: Hoe maak ik een backup van mijn data?
**A:** 
```bash
# Via Supabase Dashboard
# 1. Ga naar Settings → Database
# 2. Klik op "Database backups"
# 3. Download backup

# Via CLI (als je Supabase CLI hebt)
supabase db dump --file backup.sql
```

#### Q: Kan ik bestaande data importeren?
**A:** Ja, je kunt data importeren via:
1. **CSV Import**: Via Supabase Dashboard → Table Editor
2. **SQL Script**: Via SQL Editor in Supabase Dashboard
3. **API**: Via de bulk import endpoints

#### Q: Hoe reset ik de database?
**A:** 
```bash
# Via npm script
npm run db:reset

# Of handmatig via Supabase Dashboard
# Settings → Database → Reset database
```

### Development

#### Q: Hoe voeg ik nieuwe features toe?
**A:** 
1. Maak een feature branch: `git checkout -b feature/nieuwe-functie`
2. Volg de bestaande code structuur in `app/`, `components/`, `lib/`
3. Voeg tests toe in `__tests__/`
4. Update documentatie indien nodig
5. Maak een Pull Request

#### Q: Hoe run ik de tests?
**A:** 
```bash
# Alle tests
npm test

# Tests in watch mode
npm run test:watch

# Tests met coverage
npm run test:coverage

# Alleen unit tests
npm run test:unit

# Alleen integration tests
npm run test:integration
```

#### Q: Hoe debug ik de applicatie?
**A:** 
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check browser console voor client-side errors
# Check terminal voor server-side errors

# Use React Developer Tools voor component debugging
```

---

## 🎨 Gebruikersvragen

### Tuinbeheer

#### Q: Hoe maak ik een nieuwe tuin aan?
**A:** 
1. Klik op "Nieuwe Tuin" op de homepage
2. Vul de vereiste velden in (naam, locatie)
3. Voeg optionele informatie toe (beschrijving, oppervlakte, type)
4. Klik "Opslaan"

#### Q: Kan ik meerdere tuinen beheren?
**A:** Ja, je kunt onbeperkt tuinen aanmaken en beheren. Elke tuin heeft zijn eigen plantvakken en planten.

#### Q: Hoe verwijder ik een tuin?
**A:** 
1. Ga naar de tuin die je wilt verwijderen
2. Klik op het menu (⋯) en selecteer "Verwijderen"
3. Bevestig de actie
**Note**: Dit is een soft delete - de data blijft bewaard maar wordt niet meer getoond.

#### Q: Kan ik een tuin dupliceren?
**A:** Momenteel is er geen directe duplicate functie, maar je kunt:
1. Een nieuwe tuin aanmaken met vergelijkbare gegevens
2. Plantvakken handmatig kopiëren
3. Planten opnieuw toevoegen

### Plantvakken

#### Q: Hoe gebruik ik de visuele designer?
**A:** 
1. Open een tuin
2. Klik op "Designer" of "Bewerken"
3. Sleep plantvakken van de zijbalk naar het canvas
4. Gebruik de handles om de grootte aan te passen
5. Klik en sleep om te verplaatsen
6. Gebruik het eigenschappen paneel voor details

#### Q: Kan ik plantvakken roteren?
**A:** Ja, selecteer een plantvak en gebruik het rotatie control of voer een exacte waarde in het eigenschappen paneel.

#### Q: Hoe stel ik de canvas grootte in?
**A:** 
1. Ga naar tuin instellingen (tandwiel icoon)
2. Pas canvas breedte en hoogte aan
3. Stel grid grootte en zoom in
4. Klik "Opslaan"

#### Q: Waarom snap mijn plantvakken niet naar het grid?
**A:** Check of "Snap to Grid" is ingeschakeld in de tuin instellingen. Je kunt dit ook tijdelijk uitschakelen door Shift ingedrukt te houden tijdens slepen.

### Planten

#### Q: Hoe voeg ik planten toe?
**A:** 
1. Selecteer een plantvak
2. Klik op "Plant toevoegen" of het + icoon
3. Zoek naar een plant in de database of voer handmatig in
4. Vul de gewenste eigenschappen in
5. Klik "Opslaan"

#### Q: Welke planten zitten in de database?
**A:** De database bevat uitgebreide Nederlandse bloemen en planten, inclusief:
- Voorjaarsbloemen (tulpen, narcissen, krokussen)
- Zomerbloemen (rozen, lavendel, zonnebloemen)
- Najaarsbloemen (chrysanten, dahlia's)
- Winterharde planten (heide, winterviooltjes)
- En veel meer...

#### Q: Kan ik eigen planten toevoegen?
**A:** Ja, je kunt planten handmatig toevoegen door "Aangepaste plant" te selecteren en alle velden zelf in te vullen.

#### Q: Hoe track ik de status van mijn planten?
**A:** Elke plant heeft een status:
- **Gezond**: Plant groeit goed
- **Heeft aandacht nodig**: Requires care
- **Ziek**: Plant has disease
- **Dood**: Plant heeft het niet gered
- **Geoogst**: Plant is geoogst

#### Q: Kan ik foto's toevoegen aan planten?
**A:** Ja, je kunt foto's uploaden via het plant bewerkingsformulier. Foto's worden opgeslagen in Supabase Storage.

### Taken

#### Q: Hoe maak ik onderhoudstaken aan?
**A:** 
1. Ga naar "Taken" in het hoofdmenu
2. Klik "Nieuwe Taak"
3. Vul titel, beschrijving en type in
4. Stel prioriteit en vervaldatum in
5. Koppel aan tuin, plantvak of specifieke plant
6. Klik "Opslaan"

#### Q: Kan ik terugkerende taken instellen?
**A:** Ja, bij het aanmaken van een taak kun je "Terugkerend" aanvinken en een patroon instellen (dagelijks, wekelijks, maandelijks).

#### Q: Hoe krijg ik notificaties voor taken?
**A:** Momenteel worden notificaties getoond in de applicatie. Email/push notificaties zijn gepland voor een toekomstige versie.

---

## 🔧 Troubleshooting

### Performance

#### Q: De applicatie laadt langzaam, wat kan ik doen?
**A:** 
1. **Check je internetverbinding**
2. **Clear browser cache**: Ctrl+Shift+R (Windows) of Cmd+Shift+R (Mac)
3. **Update je browser** naar de laatste versie
4. **Disable browser extensions** die kunnen interfereren
5. **Check Supabase status**: [status.supabase.com](https://status.supabase.com)

#### Q: De visuele designer is traag bij veel plantvakken
**A:** 
1. **Reduce canvas grootte** in tuin instellingen
2. **Disable grid** tijdelijk voor betere performance
3. **Use smaller grid size** (bijv. 10px instead of 20px)
4. **Close andere browser tabs** om geheugen vrij te maken

### Errors

#### Q: Ik krijg "Database connection failed"
**A:** 
1. **Check environment variables** in `.env.local`
2. **Verify Supabase credentials** in dashboard
3. **Check internet connection**
4. **Try refreshing** de pagina
5. **Check Supabase status** voor outages

#### Q: "Validation error" bij het opslaan
**A:** 
1. **Check required fields** - naam en locatie zijn verplicht
2. **Verify field lengths** - namen max 255 karakters
3. **Check special characters** in invoervelden
4. **Try refreshing** en opnieuw proberen

#### Q: Foto upload faalt
**A:** 
1. **Check file size** - max 5MB per foto
2. **Verify file type** - alleen JPG, PNG, WebP
3. **Check internet connection** tijdens upload
4. **Try smaller image** of compress eerst
5. **Check Supabase storage** quota in dashboard

#### Q: "Not found" error bij navigatie
**A:** 
1. **Check URL** voor typos
2. **Verify item exists** - mogelijk verwijderd door andere gebruiker
3. **Try refreshing** de pagina
4. **Go back** en probeer opnieuw

### Data Issues

#### Q: Mijn data is verdwenen!
**A:** 
1. **Don't panic** - data wordt zelden echt verwijderd
2. **Check filters** - mogelijk zijn items gefilterd
3. **Check "actief" status** - items kunnen gedeactiveerd zijn
4. **Contact support** met details over wat je mist
5. **Check Supabase dashboard** voor raw data

#### Q: Ik kan niet inloggen
**A:** 
1. **Check credentials** - email en wachtwoord
2. **Try password reset** via "Wachtwoord vergeten"
3. **Check email spam** voor reset links
4. **Clear browser data** en probeer opnieuw
5. **Try incognito mode** om cache issues uit te sluiten

---

## 🚀 Deployment & Hosting

#### Q: Kan ik het systeem zelf hosten?
**A:** Ja, je kunt het systeem deployen op:
- **Vercel** (aanbevolen)
- **Netlify**
- **AWS/Azure/GCP**
- **Eigen server** met Node.js support

#### Q: Hoe deploy ik naar productie?
**A:** Zie de [Deployment Guide](./deployment.md) voor gedetailleerde instructies.

#### Q: Kan ik een custom domain gebruiken?
**A:** Ja, je kunt een custom domain configureren in je hosting provider (Vercel/Netlify).

#### Q: Hoe scale ik voor meer gebruikers?
**A:** 
1. **Supabase**: Upgrade naar Pro plan voor meer database resources
2. **Vercel**: Pro plan voor meer bandwidth en functies
3. **CDN**: Use Vercel's global CDN voor snellere loading
4. **Caching**: Implement additional caching strategies

---

## 📱 Mobile & Cross-Platform

#### Q: Is er een mobiele app?
**A:** Het systeem is een Progressive Web App (PWA) die werkt op mobiele browsers. Een native app is gepland voor de toekomst.

#### Q: Kan ik het offline gebruiken?
**A:** Beperkte offline functionaliteit is beschikbaar via PWA features. Volledige offline sync is in ontwikkeling.

#### Q: Werkt het op tablets?
**A:** Ja, het systeem is geoptimaliseerd voor tablets en biedt een goede touch experience.

---

## 🔒 Security & Privacy

#### Q: Hoe veilig is mijn data?
**A:** 
- **Supabase** biedt enterprise-grade security
- **Row Level Security** zorgt voor data isolatie
- **HTTPS** voor alle communicatie
- **Regular backups** voor data recovery

#### Q: Wie kan mijn tuinen zien?
**A:** Alleen jij kunt je eigen tuinen zien, tenzij je expliciet toegang deelt (feature in ontwikkeling).

#### Q: Hoe verwijder ik mijn account?
**A:** Contact support voor account verwijdering. We volgen GDPR richtlijnen voor data verwijdering.

---

## 🆘 Support

#### Q: Hoe krijg ik hulp?
**A:** 
1. **Check deze FAQ** voor veelvoorkomende vragen
2. **Read documentation** in de `docs/` folder
3. **Create GitHub issue** voor bugs of feature requests
4. **Contact support** via email (indien beschikbaar)

#### Q: Hoe rapporteer ik een bug?
**A:** 
1. **Go to GitHub repository**
2. **Create new issue**
3. **Use bug report template**
4. **Include steps to reproduce**
5. **Add screenshots** indien relevant

#### Q: Kan ik feature requests doen?
**A:** Ja! Maak een GitHub issue met het "enhancement" label en beschrijf je gewenste feature.

---

**Laatste update**: December 2024  
**Versie**: 1.0.0

*Mis je een vraag in deze FAQ? [Maak een issue aan](https://github.com/your-repo/issues) en we voegen hem toe!*
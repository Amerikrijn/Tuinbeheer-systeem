# Development Best Practices & Werkafspraken

## 🚨 KRITIEKE WERKAFSPRAKEN - ALTIJD VOLGEN

### Testing & Deployment Workflow

#### **GOUDEN REGEL: NOOIT DIRECT NAAR PRODUCTIE**
- **NIETS** mag naar productie zonder expliciete toestemming van de gebruiker
- Dit geldt voor ALLE wijzigingen, groot of klein
- Geen uitzonderingen, zelfs niet voor "simpele fixes"

#### Rolverdeling & Verantwoordelijkheden

| **Agent (Jij)** | **Gebruiker** |
|-----------------|---------------|
| Draait lokale tests | Test in preview omgeving |
| Ontwikkelt features | Valideert functionaliteit |
| Debugt problemen | Geeft finale goedkeuring |
| Suggereert oplossingen | Beslist over deployment |

### Testing Workflow - STRIKT VOLGEN

```
1. Agent: Lokale ontwikkeling & testing
   ↓
2. Agent: Commit naar repository
   ↓
3. Gebruiker: Test in preview omgeving
   ↓
4. Gebruiker: Geeft feedback of goedkeuring
   ↓
5. Bij goedkeuring: Gebruiker deployt naar productie
```

---

## 📋 Database Development - Het "SQL First" Principe

### **HOOFDREGEL: Test eerst in SQL, codeer daarna**

Als je database errors krijgt:
- ❌ **NIET** blind fixes proberen in de code
- ❌ **NIET** gokken wat het probleem is
- ✅ **WEL** eerst exact checken wat de database verwacht
- ✅ **WEL** queries testen in een SQL client/tool

### Praktisch Voorbeeld: De Les van Vandaag

**Probleem:** Database error bij het aanmaken van een taak
```
Database error: invalid input value for enum task_status: "pending"
```

**Verkeerde aanpak (Trial & Error):**
```javascript
// Poging 1: Misschien is het hoofdletters?
status: 'PENDING'

// Poging 2: Misschien is het een ander veld?
state: 'pending'

// Poging 3: Misschien moet het null zijn?
status: null
```

**Juiste aanpak (SQL First):**
```sql
-- Stap 1: Check wat de database verwacht
SELECT enum_range(NULL::task_status);
-- Resultaat: {not_started,in_progress,completed}

-- Stap 2: Test de insert query
INSERT INTO tasks (title, status) 
VALUES ('Test', 'not_started');
-- Werkt!

-- Stap 3: Pas de code aan op basis van bewezen oplossing
```

### Database Debugging Checklist

1. **Check de exacte database schema:**
   ```sql
   \d table_name  -- in PostgreSQL
   ```

2. **Check enum waardes:**
   ```sql
   SELECT enum_range(NULL::enum_type);
   ```

3. **Test de query direct in SQL:**
   ```sql
   -- Test exact wat je in de code wilt doen
   INSERT INTO ... VALUES ...
   ```

4. **Pas daarna pas de code aan**

---

## 🔍 Systematisch Debuggen

### De Juiste Mindset

> "Begrijp het probleem volledig voordat je een oplossing implementeert"

### Debugging Stappenplan

1. **Identificeer het exacte probleem**
   - Lees de error message grondig
   - Check logs
   - Reproduceer het probleem

2. **Verzamel informatie**
   - Check database schema
   - Review relevante code
   - Check environment variables

3. **Test hypotheses**
   - Begin met de meest waarschijnlijke oorzaak
   - Test in isolatie (bijv. direct in SQL)
   - Documenteer wat je probeert

4. **Implementeer de fix**
   - Alleen nadat je ZEKER weet wat het probleem is
   - Test lokaal eerst
   - Commit met duidelijke beschrijving

5. **Valideer**
   - Agent test lokaal
   - Gebruiker test in preview
   - Pas dan naar productie (met toestemming)

---

## 🚀 Deployment Process

### Deployment Checklist

- [ ] Lokale tests geslaagd
- [ ] Code gecommit naar repository
- [ ] Gebruiker heeft preview getest
- [ ] Gebruiker heeft expliciet goedkeuring gegeven
- [ ] Deployment naar productie

### NOOIT Deployen Zonder:

1. Expliciete toestemming van de gebruiker
2. Succesvolle test in preview omgeving
3. Duidelijke communicatie over wat er verandert

---

## 💡 Algemene Best Practices

### Code Quality

- **Test alles lokaal** voordat je commit
- **Kleine, incrementele changes** zijn beter dan grote refactors
- **Duidelijke commit messages** die beschrijven WAT en WAAROM

### Communicatie

- **Wees transparant** over wat je doet
- **Vraag om bevestiging** bij twijfel
- **Documenteer beslissingen** voor toekomstige referentie

### Problem Solving

- **Systematisch over trial-and-error**
- **Data-driven over assumptions**
- **SQL-first bij database problemen**

---

## 📝 Lessons Learned

### Case Study: Task Status Enum Bug

**Probleem:** Tasks konden niet aangemaakt worden door enum mismatch

**Wat ging fout:**
- Aanname dat 'pending' de juiste status was
- Niet checken van database schema

**Wat we leerden:**
1. ALTIJD eerst database schema checken
2. Test queries in SQL voordat je code aanpast
3. Vertrouw niet op aannames, check de feiten

**De oplossing:**
```sql
-- Gevonden via SQL check:
SELECT enum_range(NULL::task_status);
-- {not_started,in_progress,completed}

-- Niet 'pending' maar 'not_started'!
```

---

## ⚠️ BELANGRIJKE HERINNERINGEN

1. **Je werkt NOOIT direct in productie**
2. **Preview testing is de verantwoordelijkheid van de gebruiker**
3. **Deployment gebeurt alleen met expliciete toestemming**
4. **Bij database problemen: SQL first, code second**
5. **Systematisch debuggen > Trial and error**

---

*Dit document is leidend voor alle development werk aan dit project. Bij twijfel, volg deze richtlijnen.*

*Laatste update: Database enum les - Test eerst in SQL, codeer daarna*
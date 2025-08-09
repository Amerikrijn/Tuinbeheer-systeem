# RLS Implementation Troubleshooting Guide

## 🔧 **Veelvoorkomende RLS Fouten & Oplossingen**

### **Fout 1: "column does not exist" Errors**

**Probleem:** RLS policies verwijzen naar kolommen die niet bestaan in de tabel.

**Oorzaak:** Verschillende database schema versies hebben verschillende kolom namen.

**Oplossing:** Controleer altijd de exacte tabel structuur eerst.

#### **Bekende Kolom Verschillen:**

| Tabel | Verwachte Kolom | Werkelijke Kolom | Oplossing |
|-------|----------------|------------------|-----------|
| `logbook_entries` | `garden_id` | `plant_bed_id` | Via plant_beds.garden_id join |
| `tasks` | `garden_id` | `plant_bed_id` | Via plant_beds.garden_id join |
| `plants` | `garden_id` | `plant_bed_id` | Via plant_beds.garden_id join |
| `user_garden_access` | `is_active` | Kolom bestaat niet | Weglaten uit queries |

#### **Correcte RLS Patterns:**

**Voor tabellen MET garden_id:**
```sql
CREATE POLICY "secure_access" ON table_name
  FOR ALL USING (
    user_has_permission(auth.uid(), 'resource', 'admin') OR
    garden_id IN (
      SELECT garden_id FROM user_garden_access WHERE user_id = auth.uid()
    )
  );
```

**Voor tabellen MET plant_bed_id (geen garden_id):**
```sql
CREATE POLICY "secure_access" ON table_name
  FOR ALL USING (
    user_has_permission(auth.uid(), 'resource', 'admin') OR
    plant_bed_id IN (
      SELECT pb.id 
      FROM plant_beds pb
      JOIN user_garden_access uga ON pb.garden_id = uga.garden_id
      WHERE uga.user_id = auth.uid()
    )
  );
```

### **Fout 2: Permission Function Errors**

**Probleem:** `user_has_permission` functie bestaat niet.

**Oplossing:** Zorg dat Fase 2 (Authentication) is voltooid voordat je RLS implementeert.

### **Fout 3: Policy Already Exists**

**Probleem:** `CREATE POLICY` faalt omdat policy al bestaat.

**Oplossing:** Gebruik altijd `DROP POLICY IF EXISTS` eerst:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name FOR ALL USING (...);
```

### **Fout 4: RLS Blokkeert Alle Access**

**Probleem:** Na RLS enable kan niemand meer data zien.

**Oplossing:** Emergency disable:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

## 🔍 **Pre-RLS Checklist**

Voordat je RLS implementeert op een tabel:

1. **Controleer tabel structuur:**
```sql
\d table_name
-- OF
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table';
```

2. **Controleer bestaande policies:**
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'your_table';
```

3. **Test permission functie:**
```sql
SELECT user_has_permission('user-id', 'resource', 'action');
```

## 🚨 **Emergency Procedures**

**Als RLS alles blokkeert:**

```sql
-- Disable RLS op alle tabellen
ALTER TABLE gardens DISABLE ROW LEVEL SECURITY;
ALTER TABLE plant_beds DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Test daarna functionaliteit en implementeer opnieuw met correcte kolommen.**

## 📋 **RLS Implementation Volgorde**

1. **Fase 2 moet compleet zijn** (Authentication & Authorization)
2. **Start met laag-risico tabellen** (logbook_entries)
3. **Test tussen elke stap**
4. **Controleer kolom structuur** voordat je policies maakt
5. **Gebruik correcte join patterns**

## 🔧 **Kolom Structuur Verificatie Script**

```sql
-- Run dit om alle relevante tabel structuren te zien
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('gardens', 'plant_beds', 'plants', 'logbook_entries', 'tasks', 'users')
ORDER BY t.table_name, c.ordinal_position;
```

Dit toont je exact welke kolommen elke tabel heeft, zodat je correcte RLS policies kunt schrijven.
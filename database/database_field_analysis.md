# Database Field Analysis - Ongebruikte Velden

## Analyse uitgevoerd op: $(date)

Gebaseerd op de analyse van de codebase, hier zijn de databasevelden die zijn gedefinieerd maar niet actief worden gebruikt in forms of applicatielogica:

## 1. Tuin (Garden) Tabel

### Gedefinieerde velden in types:
- id ✅ (gebruikt)
- name ✅ (gebruikt)
- description ✅ (gebruikt)
- location ✅ (gebruikt)
- total_area ✅ (gebruikt)
- length ✅ (gebruikt)
- width ✅ (gebruikt)
- garden_type ✅ (gebruikt)
- established_date ✅ (gebruikt)
- season_year ❌ (NIET GEBRUIKT in forms)
- notes ✅ (gebruikt)
- is_active ✅ (gebruikt)
- created_at ✅ (gebruikt)
- updated_at ✅ (gebruikt)

### Visual properties (mogelijk niet gebruikt in forms):
- canvas_width ❌ (NIET GEBRUIKT in forms)
- canvas_height ❌ (NIET GEBRUIKT in forms)
- grid_size ❌ (NIET GEBRUIKT in forms)
- default_zoom ❌ (NIET GEBRUIKT in forms)
- show_grid ❌ (NIET GEBRUIKT in forms)
- snap_to_grid ❌ (NIET GEBRUIKT in forms)
- background_color ❌ (NIET GEBRUIKT in forms)

## 2. Plantvak (Plant Bed) Tabel

### Gedefinieerde velden:
- id ✅ (gebruikt)
- garden_id ✅ (gebruikt)
- name ✅ (gebruikt)
- letter_code ❌ (NIET GEBRUIKT in forms - auto-generated)
- location ✅ (gebruikt)
- size ✅ (gebruikt)
- soil_type ✅ (gebruikt)
- sun_exposure ✅ (gebruikt)
- season_year ❌ (NIET GEBRUIKT in forms)
- description ✅ (gebruikt)
- is_active ✅ (gebruikt)
- created_at ✅ (gebruikt)
- updated_at ✅ (gebruikt)

### Visual properties (mogelijk niet gebruikt in forms):
- position_x ❌ (NIET GEBRUIKT in forms)
- position_y ❌ (NIET GEBRUIKT in forms)
- visual_width ❌ (NIET GEBRUIKT in forms)
- visual_height ❌ (NIET GEBRUIKT in forms)
- rotation ❌ (NIET GEBRUIKT in forms)
- z_index ❌ (NIET GEBRUIKT in forms)
- color_code ❌ (NIET GEBRUIKT in forms)
- visual_updated_at ❌ (NIET GEBRUIKT in forms)

## 3. Plant (Bloem) Tabel

### Gedefinieerde velden:
- id ✅ (gebruikt)
- plant_bed_id ✅ (gebruikt)
- name ✅ (gebruikt)
- scientific_name ✅ (gebruikt)
- latin_name ❌ (MOGELIJK DUBBEL met scientific_name)
- variety ✅ (gebruikt)
- color ❌ (MOGELIJK DUBBEL met plant_color)
- plant_color ✅ (gebruikt)
- height ❌ (MOGELIJK DUBBEL met plant_height)
- plant_height ✅ (gebruikt)
- stem_length ❌ (NIET GEBRUIKT in forms)
- plants_per_sqm ❌ (NIET GEBRUIKT in forms)
- sun_preference ❌ (NIET GEBRUIKT in forms)
- photo_url ✅ (gebruikt)
- category ❌ (NIET GEBRUIKT in forms)
- bloom_period ❌ (NIET GEBRUIKT in forms)
- planting_date ✅ (gebruikt)
- expected_harvest_date ✅ (gebruikt)
- status ✅ (gebruikt)
- notes ✅ (gebruikt)
- care_instructions ❌ (NIET GEBRUIKT in forms)
- watering_frequency ❌ (NIET GEBRUIKT in forms)
- fertilizer_schedule ❌ (NIET GEBRUIKT in forms)
- emoji ❌ (NIET GEBRUIKT in forms)
- is_custom ❌ (NIET GEBRUIKT in forms)
- created_at ✅ (gebruikt)
- updated_at ✅ (gebruikt)

### Visual properties:
- position_x ❌ (NIET GEBRUIKT in forms)
- position_y ❌ (NIET GEBRUIKT in forms)
- visual_width ❌ (NIET GEBRUIKT in forms)
- visual_height ❌ (NIET GEBRUIKT in forms)

## 4. Tasks Tabel

### Gedefinieerde velden:
- id ✅ (gebruikt)
- plant_id ✅ (gebruikt)
- plant_bed_id ✅ (gebruikt)
- title ✅ (gebruikt)
- description ✅ (gebruikt)
- due_date ✅ (gebruikt)
- completed ✅ (gebruikt)
- completed_at ✅ (gebruikt)
- priority ✅ (gebruikt)
- task_type ✅ (gebruikt)
- notes ✅ (gebruikt)
- created_at ✅ (gebruikt)
- updated_at ✅ (gebruikt)
- created_by ❌ (NIET GEBRUIKT in forms)
- is_active ❌ (NIET GEBRUIKT in forms)

## 5. Logbook Entries Tabel

### Gedefinieerde velden:
- id ✅ (gebruikt)
- plant_bed_id ✅ (gebruikt)
- plant_id ✅ (gebruikt)
- entry_date ✅ (gebruikt)
- notes ✅ (gebruikt)
- photo_url ✅ (gebruikt)
- created_at ✅ (gebruikt)
- updated_at ✅ (gebruikt)
- created_by ❌ (NIET GEBRUIKT in forms)
- is_active ❌ (NIET GEBRUIKT in forms)

## 6. User Tabel

### Gedefinieerde velden:
- id ✅ (gebruikt)
- email ✅ (gebruikt)
- full_name ✅ (gebruikt)
- avatar_url ❌ (NIET GEBRUIKT in forms)
- role ✅ (gebruikt)
- status ❌ (NIET GEBRUIKT in forms)
- permissions ✅ (gebruikt)
- garden_access ✅ (gebruikt)
- created_at ✅ (gebruikt)
- last_login ❌ (NIET GEBRUIKT in forms)
- force_password_change ✅ (gebruikt)

## Samenvatting van Ongebruikte Velden

### Hoge prioriteit (waarschijnlijk veilig om te verwijderen):
1. **season_year** - Niet gebruikt in forms, mogelijk legacy
2. **stem_length** - Niet gebruikt in forms

### Medium prioriteit (gebruikt maar mogelijk redundant):
1. **plants_per_sqm** ✅ (GEBRUIKT in plant detail views en forms)
2. **category** ✅ (GEBRUIKT in plantvak designer)
3. **bloom_period** ✅ (GEBRUIKT in garden overview)
4. **care_instructions** ✅ (GEBRUIKT in plant forms en detail views)
5. **watering_frequency** ✅ (GEBRUIKT in plant forms en detail views)
6. **fertilizer_schedule** ✅ (GEBRUIKT in plant forms en detail views)
7. **emoji** ✅ (EXTENSIEF GEBRUIKT in hele applicatie)
8. **is_custom** ✅ (GEBRUIKT in plantvak designer)

### Mogelijke duplicaten:
1. **latin_name vs scientific_name** - Beide aanwezig, mogelijk redundant
2. **color vs plant_color** - Beide aanwezig, mogelijk redundant
3. **height vs plant_height** - Beide aanwezig, mogelijk redundant

### Visual/Canvas velden (ACTIEF GEBRUIKT door designer):
1. **canvas_width, canvas_height** ✅ (GEBRUIKT in API routes)
2. **grid_size, default_zoom** ❌ (NIET GEBRUIKT)
3. **show_grid, snap_to_grid, background_color** ❌ (NIET GEBRUIKT)
4. **position_x, position_y, visual_width, visual_height** ✅ (EXTENSIEF GEBRUIKT in plantvak designer)
5. **rotation, z_index, color_code** ✅ (GEBRUIKT in plantvak designer)
6. **visual_updated_at** ❌ (NIET GEBRUIKT)

### Audit velden (mogelijk gebruikt door systeem maar niet in forms):
1. **created_by** - Audit trail
2. **is_active** - Soft delete flag
3. **last_login** - User tracking
4. **status** - User status tracking

## DEFINITIEVE LIJST VAN ONGEBRUIKTE VELDEN

### Veilig om te verwijderen (hoge prioriteit):
1. **season_year** (Tuin & Plantvak tabellen)
2. **stem_length** (Plant tabel)
3. **grid_size** (Tuin tabel)
4. **default_zoom** (Tuin tabel)
5. **show_grid** (Tuin tabel)
6. **snap_to_grid** (Tuin tabel)
7. **background_color** (Tuin tabel)
8. **visual_updated_at** (Plantvak tabel)

### Mogelijke duplicaten om op te schonen:
1. **latin_name** vs **scientific_name** (Plant tabel)
2. **color** vs **plant_color** (Plant tabel)
3. **height** vs **plant_height** (Plant tabel)

### Audit velden (behouden voor systeem functionaliteit):
1. **created_by** (Tasks & Logbook tabellen)
2. **is_active** (Tasks & Logbook tabellen)
3. **last_login** (User tabel)
4. **status** (User tabel)

## Aanbevelingen

1. **VERWIJDER de 8 velden uit de hoge prioriteit lijst** - Deze worden nergens gebruikt
2. **CONSOLIDEER duplicaten** - Kies één van elke duplicaat set en update alle code
3. **BEHOUD alle visual/designer velden** - Deze zijn actief in gebruik
4. **BEHOUD audit velden** - Nodig voor tracking en soft deletes
5. **Update TypeScript types** na database wijzigingen
6. **Maak database migratie scripts** voor productie
7. **Test grondig** elke wijziging

## Risico's

- Forms kunnen breken als velden worden verwijderd die onverwacht toch worden gebruikt
- Database migraties nodig voor productie
- Mogelijk data verlies als velden worden verwijderd

## Volgende stappen

1. Verificeer dat visual velden niet worden gebruikt door designer componenten
2. Controleer of audit velden niet worden gebruikt door middleware
3. Maak database migratie scripts
4. Update TypeScript types
5. Test alle forms en functionaliteit
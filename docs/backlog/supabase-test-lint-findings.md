# 🧪 Supabase Testomgeving – Security Lint Findings

Bron: Supabase Database Linter (test omgeving)

## ⚡ Overzicht
- Ernst: Meerdere ERRORS en WARNS
- Impact: Toegangsbeveiliging (RLS), privileges via views, function security posture, Auth-config
- Actie: Fixen in test-omgeving, valideren, daarna migreren naar acceptatie/productie

---

## 🚨 Errors (moet eerst)

### 1) Policy Exists RLS Disabled
Detectie: RLS policies bestaan, maar RLS is niet geactiveerd op de tabel.

- Tabel: `public.tasks`
  - Policies: `{tasks_secure_access}`
  - Actie:
    - [ ] `ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;`
    - [ ] Policies reviewen en testen

- Tabel: `public.users`
  - Policies: `{"Admins can manage all users", "Service role full access", "Users can read own profile", "Users can update own profile", users_secure_access}`
  - Actie:
    - [ ] `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
    - [ ] Policies reviewen en testen

Referentie: `0007_policy_exists_rls_disabled`

---

### 2) RLS Disabled in Public
Detectie: Tabellen in `public` (exposed via PostgREST) zonder RLS.

- Kern-tabellen:
  - [ ] `public.operational_risk_events`
  - [ ] `public.users`
  - [ ] `public.audit_log_backup`
  - [ ] `public.tasks`
  - [ ] `public.encrypted_storage`
  - [ ] `public.blocked_ips`
  - [ ] `public.threat_scores`
  - [ ] `public.compliance_events`
  - [ ] `public.data_processing_activities`
  - [ ] `public.dnb_compliance_checks`
  - [ ] `public.audit_log_copy`

- Kopie-tabellen (consolideren of privatizen indien niet nodig via API):
  - [ ] `public.users_copy`, `public.gardens_copy`, `public.plant_beds_copy`, `public.plants_copy`, `public.logbook_entries_copy`, `public.user_garden_access_copy`, `public.user_permissions_copy`, `public.role_permissions_copy`, `public.tasks_copy`, `public.blocked_ips_copy`, `public.compliance_events_copy`, `public.dnb_compliance_checks_copy`, `public.encrypted_storage_copy`, `public.operational_risk_events_copy`, `public.threat_scores_copy`, `public.data_processing_activities_copy`

- Standaard remediatie (voor elke tabel die publiek moet blijven):
  - [ ] `ALTER TABLE <schema>.<table> ENABLE ROW LEVEL SECURITY;`
  - [ ] Minimaal 1 lees-policy voor geautoriseerde gebruikers
  - [ ] Schrijf-policies per rol/attribuut
  - [ ] Test met anonieme en authenticated rol

- Alternatieven (als niet via API nodig):
  - [ ] Verplaats naar private schema (bv. `internal`)
  - [ ] Verberg schema voor PostgREST (config)

Referentie: `0013_rls_disabled_in_public`

---

### 3) Security Definer View
Detectie: Views met definer semantics; query gebruikt privileges/RLS van de maker i.p.v. van de aanroeper. In Postgres 15 kan dit vaak worden opgelost door `security_invoker = true` te zetten.

Views:
- [ ] `public.plants_with_area_info`
- [ ] `public.compliance_dashboard_realtime`
- [ ] `public.security_summary_daily`
- [ ] `public.plant_task_stats`
- [ ] `public.weekly_tasks`
- [ ] `public.logbook_entries_with_details`
- [ ] `public.tasks_with_plant_info`
- [ ] `public.security_dashboard`

Remediatie (per view, indien functioneel mogelijk):
- [ ] `ALTER VIEW <schema>.<view> SET (security_invoker = true);`
- [ ] Controleer of onderliggende tabellen correcte RLS hebben
- [ ] Functionele regressietest uitvoeren

Referentie: `0010_security_definer_view`

---

## ⚠️ Warnings

### Function Search Path Mutable
Detectie: Functies zonder vaste `search_path` (rol-mutable), wat tot privilege confusion kan leiden.

Functies:
- [ ] `public.get_user_with_permissions`
- [ ] `public.log_security_event`
- [ ] `public.invite_user_internal`
- [ ] `public.set_completed_at`
- [ ] `public.get_tasks_for_week`
- [ ] `public.create_recurring_task`
- [ ] `public.check_canvas_boundaries`
- [ ] `public.find_optimal_position`
- [ ] `public.detect_sql_injection`
- [ ] `public.detect_xss_attempt`
- [ ] `public.validate_input`
- [ ] `public.audit_trigger_function`
- [ ] `public.check_plant_bed_collision`
- [ ] `public.get_plant_bed_neighbors`
- [ ] `public.create_user_profile`
- [ ] `public.is_ip_blocked`
- [ ] `public.block_ip_manual`
- [ ] `public.handle_data_subject_request`
- [ ] `public.update_visual_updated_at`
- [ ] `public.detect_security_threats`
- [ ] `public.generate_daily_compliance_report`
- [ ] `public.generate_weekly_compliance_dashboard`
- [ ] `public.export_compliance_audit_trail`
- [ ] `public.store_encrypted_data`
- [ ] `public.retrieve_encrypted_data`
- [ ] `public.user_has_permission`
- [ ] `public.is_user_locked`
- [ ] `public.detect_security_threats_simple`
- [ ] `public.assess_dnb_cyber_security`
- [ ] `public.log_operational_risk_event`
- [ ] `public.generate_executive_compliance_summary`
- [ ] `public.handle_login_attempt`
- [ ] `public.update_updated_at_column`

Remediatie (per functie):
- [ ] Hercreëer als: `CREATE OR REPLACE FUNCTION ... SET search_path = public, extensions;`
- [ ] Of schema-kwalificeer alle objecten en zet `SET search_path = pg_temp` voor strengste isolatie
- [ ] Behoud `SECURITY INVOKER` tenzij aantoonbaar nodig anders

Referentie: `0011_function_search_path_mutable`

---

### Auth-config (Platform)
- [ ] OTP expiry > 1 uur verlagen naar < 1 uur
- [ ] Leaked password protection inschakelen (HaveIBeenPwned)

Labels: `security`, `auth`, `platform-config`

---

## 📋 Takenlijst (test-omgeving)
1. [ ] SQL-migratie schrijven voor RLS enablement (tabel-lijst hierboven)
2. [ ] Policies controleren/aanvullen per tabel en per rol
3. [ ] Views updaten naar `security_invoker = true` waar mogelijk, en valideren
4. [ ] Functies hercreëren met vaste `search_path`
5. [ ] Auth-config: OTP expiry en leaked password protection aanpassen
6. [ ] End-to-end tests: anonieme vs. authenticated toegang, admin vs. user scenario’s

## 🏷️ Issue-voorstellen (GitHub)
- `🔐 Enable RLS on public tables (test)` — labels: `security`, `supabase`, `rls`, `test-env`
- `🧭 Fix view security semantics to invoker (test)` — labels: `security`, `supabase`, `views`, `test-env`
- `🧰 Fix function search_path and harden functions (test)` — labels: `security`, `supabase`, `functions`, `test-env`
- `🔑 Auth config hardening (test)` — labels: `security`, `auth`, `platform`, `test-env`

## ✅ Acceptatiecriteria
- [ ] Alle ERRORS verholpen in test-omgeving
- [ ] Warnings geadresseerd of gemotiveerd geaccepteerd
- [ ] PostgREST access gecontroleerd volgens RLS
- [ ] Geen privilege escalation via views/functies
- [ ] Documentatie en SQL-scripts opgeslagen in repo
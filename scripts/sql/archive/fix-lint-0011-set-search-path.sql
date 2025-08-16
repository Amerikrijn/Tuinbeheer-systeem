-- Fix Supabase linter 0011: ensure functions have a fixed search_path
-- Run this against your main database (production) to eliminate the warnings

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_updated_at_column',
        'update_visual_updated_at',
        'soft_delete_garden',
        'update_plant_bed_positions',
        'verify_test_environment',
        'log_security_event',
        'validate_input',
        'is_user_locked',
        'handle_login_attempt',
        'store_encrypted_data',
        'is_ip_blocked',
        'detect_security_threats_simple',
        'handle_data_subject_request',
        'assess_dnb_cyber_security'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, public',
      r.schema_name,
      r.function_name,
      r.args
    );
  END LOOP;
END $$;

-- Optional: verify all targeted functions now have search_path set
-- SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.proconfig
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'update_updated_at_column','update_visual_updated_at','soft_delete_garden','update_plant_bed_positions',
--     'verify_test_environment','log_security_event','validate_input','is_user_locked','handle_login_attempt',
--     'store_encrypted_data','is_ip_blocked','detect_security_threats_simple','handle_data_subject_request',
--     'assess_dnb_cyber_security'
--   );
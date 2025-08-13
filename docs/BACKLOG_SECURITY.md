# Backlog: Resolve Supabase Security Linter Warnings

- Owner: Security/Platform
- Priority: High
- Status: Backlog
- Context: Detected in production (main)

## Items
1) Lint 0011: function_search_path_mutable (multiple `public.*` functions)
2) Auth: OTP expiry too long
3) Auth: Leaked password protection disabled

## Details
- Functions flagged (schema `public`):
  - update_updated_at_column
  - update_visual_updated_at
  - soft_delete_garden
  - update_plant_bed_positions
  - verify_test_environment
  - log_security_event
  - validate_input
  - is_user_locked
  - handle_login_attempt
  - store_encrypted_data
  - is_ip_blocked
  - detect_security_threats_simple
  - handle_data_subject_request
  - assess_dnb_cyber_security

## Proposed Resolution (deferred)
- For all above functions, set a fixed search_path (e.g., `pg_catalog, public`).
- Reduce Auth OTP expiry to < 3600 seconds (recommend 900s).
- Enable Leaked Password Protection in Auth.

## Acceptance Criteria
- All flagged functions show no 0011 warning in the Supabase linter.
- Auth settings reflect: OTP expiry < 1 hour; Leaked password protection ON.
- Documented verification query/output stored in `docs/security/verification/`.

## References
- Supabase Linter 0011: Function Search Path Mutable: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- Auth OTP expiry: https://supabase.com/docs/guides/platform/going-into-prod#security
- Leaked password protection: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Notes
- A helper SQL script exists but should only be executed when tackling this backlog item: `/workspace/fix-lint-0011-set-search-path.sql`
- NPM helper to run (requires DATABASE_URL): `npm run db:fix:search-path`
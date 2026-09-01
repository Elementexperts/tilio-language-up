# tilio-language-up

Language learning app.

## Authentication mode

Authentication is controlled centrally by `NEXT_PUBLIC_AUTH_MODE`:

- `optional` (default): learners can onboard and keep progress in the persisted local Zustand store without an account. Cloud reads and writes run only when a valid Supabase/Telegram session exists.
- `required`: restores the sign-in-first entry flow.

Set the value in the deployment environment and rebuild the app after changing it. Supabase RLS, auth utilities, account screens, Telegram auth, and admin/tester authorization remain unchanged. No database migration is required.

# NeuroCRM

## Development

```bash
npm install
npm run dev
```

The app works in local demo mode until Supabase environment variables are configured.

## Supabase production setup

1. Create a Supabase project in the Canadian region closest to your operations.
2. In the Supabase SQL Editor, run [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql), then [002_auth_and_public_enrollment.sql](supabase/migrations/002_auth_and_public_enrollment.sql).
3. Copy `.env.example` to `.env` and enter the project URL and publishable key from Supabase.
4. Create the first staff user in Supabase Authentication. The profile trigger creates its staff profile automatically; promote it to admin with `update public.profiles set role = 'admin' where id = 'USER_UUID';`.
5. Configure a secure server-side enrollment endpoint to call `submit_enrollment`; it is the approved public write path.

Never put a Supabase service-role key in the frontend environment file. It bypasses row-level security.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

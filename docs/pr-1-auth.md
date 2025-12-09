# PR 1 — Auth Module

Summary

- Implementación inicial del módulo `Auth` (scaffold y utilidades básicas).

What this PR includes

- `AuthService` (signal + BehaviorSubject compatibility) — login, logout, token getter, roles helpers.
- `auth.interceptor` — adjunta `Authorization: Bearer <token>` y fuerza `logout()` en 401.
- `canActivateAuth` and `canActivateRole` guards.
- `LoginComponent` (standalone) con template `login.component.html`.
- Basic unit tests added for `AuthService` and `LoginComponent`.

Files changed / added (high level)

- `src/app/features/auth/service/auth.service.ts`
- `src/app/features/auth/interceptors/auth.interceptor.ts`
- `src/app/features/auth/guards/auth.guard.ts`
- `src/app/features/auth/guards/role.guard.ts`
- `src/app/features/auth/pages/login.component.ts` + `login.component.html`
- `src/app/features/auth/service/auth.service.spec.ts` (unit tests)
- `src/app/features/auth/pages/login.component.spec.ts` (unit tests)
- `docs/pr-1-auth.md` (this file)

How to test locally (notes)

- The project uses Karma/Jasmine for unit tests. If you run `npm test` you may need a Chrome/Chromium binary available or configure a headless runner (Puppeteer). See project's README for CI instructions.
- Manual validation: run the app and attempt login flow against the backend test/staging API (set `environment.apiBase`).

Review checklist

- [ ] API endpoint shapes validated against backend (login payload & response).
- [ ] Token storage format confirmed (now stores full `AuthResponse` under `siae_token`).
- [ ] Error handling expectations (401 auto-logout) approved.
- [ ] Unit tests passing in CI (adjust Karma environment as needed).

Next steps (suggested)

- Add integration tests for login flow + interceptor. (PR 10 tests)
- Harden `AuthService.login` error handling and surface user-friendly messages.
- Add e2e scenario with Cypress for login and protected route access.
- Prepare PR description in GitHub and request review from backend owner.

Notes for reviewer

- I avoided changing global project config. If you prefer the token only stored as a string, we can change `AuthService.setUser` to store only `accessToken` and persist the rest in a separate key.

-- End of PR 1 description

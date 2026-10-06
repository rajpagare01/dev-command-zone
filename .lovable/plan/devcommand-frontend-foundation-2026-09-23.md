# DevCommand frontend foundation

## Build

- Replace the starter screen with a dark-first DevCommand application using a restrained neutral palette, blue accent, developer-focused typography, subtle borders, and responsive motion.
- Create reusable UI and application pieces for buttons, fields, cards, badges, progress, avatars, menus, modal/drawer behavior, loading placeholders, empty states, notifications, page headings, statistics, sidebar, and topbar.
- Add a responsive authenticated shell with collapsible desktop navigation and a mobile drawer.

## Pages

- Build complete `/login` and `/register` experiences with accessible client-side validation, visible password guidance, and an authentication service boundary prepared for the future Spring Boot endpoints without simulating login.
- Build a complete `/dashboard` with clearly separated presentation data for KPIs, today’s focus, DSA activity, learning progress, job status, current projects, and quick actions.
- Add polished coming-next pages for `/dsa`, `/jobs`, `/learning`, `/projects`, `/tasks`, `/analytics`, and `/settings`, with route-specific structure and metadata.
- Make `/` lead into the DevCommand experience without leaving the starter placeholder.

## Integration readiness

- Add typed frontend models and a small API client configured by `VITE_API_URL`, ready for bearer-token requests to the separate Spring Boot service.
- Keep all current dashboard values in a dedicated presentation-data module; create no backend, database, fake endpoint, or fake authentication.

## Verification

- Check navigation, form validation, menus, sidebar states, and coming-soon feedback.
- Verify desktop and 390px mobile layouts for overflow and visual issues.
- Confirm every route renders with route-specific metadata and no browser console errors.

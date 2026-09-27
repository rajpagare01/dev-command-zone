# DevCommand frontend polish

## Goal
Polish the existing product into one cohesive, production-quality dark developer command center without changing routes, API contracts, authentication, data behavior, or backend ownership rules.

## Implementation
1. **Shared visual foundation**
   - Refine semantic color, surface, border, shadow, typography, spacing, radius, focus, and motion tokens.
   - Standardize shared buttons, cards, badges, progress, inputs, tabs, loading skeletons, empty states, errors, pagination, filters, status pills, and destructive confirmations.
   - Extract only proven duplicated presentation patterns; leave service and request logic untouched.

2. **Navigation and page frame**
   - Clarify active navigation, improve collapsed and mobile navigation, remove misleading inactive controls, and strengthen account/menu treatment.
   - Keep the compact persistent workspace layout and current route structure.

3. **Daily cockpit and analytics**
   - Rebalance Dashboard around today’s workload, pending work, compact KPIs, and progress using existing analytics only.
   - Improve Analytics chart hierarchy, labels, legends, loading, empty, error, and narrow-screen behavior without adding metrics or endpoints.

4. **Tracking and productivity modules**
   - Apply one dense, readable list/table language to DSA, Jobs, Interview Rounds, Learning, Projects, Project Tasks, and Daily Tasks.
   - Preserve all server-side search/filter/sort/pagination behavior and every mutation payload.
   - Improve mobile cards, dialogs, forms, status/priority badges, loading states, useful empty actions, Retry states, and deletion warnings.

5. **Settings and authentication**
   - Replace the Settings placeholder with an honest account/session/API-connection presentation using only information already available in the app; no invented saved preferences.
   - Polish Login and Register hierarchy, validation associations, password feedback, loading, and mobile spacing without changing auth behavior.

6. **Validation**
   - Inspect every route at 1440, 1280, 1024, 768, and 390 widths.
   - Exercise representative navigation, dialogs, forms, filters, errors, empty states, and mobile drawers with backend responses safely simulated only for browser verification.
   - Check TypeScript, production build, browser console, runtime errors, overflow, accessibility names, and unchanged service contracts.

## Technical constraints
- Existing TanStack Router, React Query, Axios client, JWT flow, services, endpoint paths, methods, DTOs, and cache invalidation stay authoritative.
- No backend, database, mock-data fallback, new state library, or unnecessary dependency changes.
- Semantic design tokens remain in the global Tailwind v4 stylesheet; feature code uses shared tokens and components.
- Settings may show current account/session and frontend environment status, but will not pretend unsupported preferences persist.

## Deliverable
A fully polished existing frontend plus the requested PASS/NEEDS WORK matrix, changed-file summary, remaining issues, build result, and any integration findings.

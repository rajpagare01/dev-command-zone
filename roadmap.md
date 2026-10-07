# Dashboard command center
## Workspace visual refinement
- [ ] Apply selected terminal-centered auth composition and shared graphite/blue styling across workspace.
- [ ] Verify narrow layouts, form controls, and compilation without changing API behavior.

- [x] Improve dashboard empty guidance and section-shaped mobile skeletons; verified loading, empty layouts, and workspace links at 320/390/768/1280px with isolated UI tests.
- [x] Review narrow dashboard sections and fix wrapping or overflow.
- [x] Improve mobile dashboard touch targets and verify keyboard focus and navigation at 320–1280px with isolated layout fixtures, not live backend data.
- [x] Add global command palette and route shortcuts.
- [x] Add truthful dashboard status and priority task actions.
- [x] Verify navigation, layout, errors, and package compatibility. Live task mutations remain unverified because Spring Boot is unreachable here.- [x] Shortcuts help: '?' toggles open/close + dashboard control
- [x] Shortcuts help: label + pressed state on dashboard control, Escape/backdrop close, focus restore
- [x] Shortcuts help: focus trapped while open, focus returns to toggle on close

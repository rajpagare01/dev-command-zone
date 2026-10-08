<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

Avoid rewriting published git history; keep the connected branch in a working state to preserve project history.

## Project architecture

- Shared interaction states and semantic status treatments belong in `src/components/common`; this keeps backend-connected modules visually consistent without changing their API logic.
- Keep global command navigation in the authenticated app shell and dashboard priority actions in a separate dashboard module using existing task services; this preserves routing and central JWT handling.
- Apply workspace visual themes through global semantic tokens and shared presentation components; this keeps module services, DTOs, routing, and authentication independent of visual refinements.
- Keep dashboard motion in CSS and key section reveals only by loading/error/empty/ready phase, not response timestamps; this avoids replaying transitions or remounting controls on background refreshes.

## Design & Launch Constraints

**NEVER USE:**

- Purple gradients
- Pill-shaped buttons
- Fake reviews or fake metrics/matrices
- Vague hero text
- Emoji icons (use proper SVG/lucide icons instead)
- Em dashes
- Crazy scroll or cursor animations
- Third-party generator attribution tags
- Generic generated photos or copy
- Fake customer counters

**PRE-LAUNCH REQUIREMENTS:**

- Must connect a custom domain
- Must edit/replace the default favicon
- Must add a Privacy Policy page
- Must add a Terms and Conditions page

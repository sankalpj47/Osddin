# Development Workflow

## Branch Structure

Every repository will have:

- `main` branch → production/deployment branch
- `dev` branch → latest integrated development branch

---

## Contribution Flow

- Every contribution must be done through a separate branch.

Examples:
- `feature/autofill`
- `fix/network_algo`

- Developers will create a PR from their feature/fix branch → `dev` branch.

- PRs are primarily for:
  - Tracking changes
  - Maintaining visibility across the team
  - Keeping a clear history of work done

> All contributors currently have admin access, so PRs are not meant as strict approval gates.

---

## PR Guidelines

Each PR should contain:

- A short description of the changes
- Screenshots/videos for UI changes
- Any important notes related to testing, setup, or deployment

---

## Merge to Production

- Code from `dev` → `main` should be validated by at least one other team member before merging.

---

## Commit Practices

- Keep commits reasonably sized and focused.
  - Prefer commits within ~100–200 lines of change
  - Avoid unnecessary 2–3 line commits unless they are meaningful
  - Avoid very large commits (2000–3000+ lines) whenever possible, since they make reviewing, debugging, and rollback difficult

---

## Standard Practices

- Always pull the latest changes before starting work or pushing code:

  ```bash
  git pull origin dev
  ```

- Before opening a PR:
  - Resolve obvious issues locally
  - Ensure the code runs properly
  - Remove unnecessary debug logs/comments

- If a merge conflict affects someone else’s code or shared logic, consult the respective contributor before resolving it.

- Avoid pushing directly to `main` unless absolutely necessary.

- Keep branches short-lived. Merge completed work back into `dev` instead of letting branches stay outdated for long periods.

- Use clear and meaningful commit messages.

Examples:
- `fix: resolve login token refresh issue`
- `feat: add autofill support for forms`
- `refactor: simplify recommendation pipeline`

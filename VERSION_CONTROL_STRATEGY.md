# Preflight Checklist Application - Version Control Strategy

## 1. Overview

This document outlines the GitHub version control strategy for the Preflight Checklist application, including branching models, commit conventions, collaboration workflows, and release management practices.

**Repository:** `ayushanand29/Preflight-checklist`  
**Primary Branch:** `main`  
**Default Visibility:** Public

---

## 2. Branching Strategy

We implement a **Git Flow** branching model adapted for modern CI/CD practices.

### 2.1 Branch Types & Purposes

```
main
 ├── release branches (release/v1.0.0)
 └── hotfix branches (hotfix/critical-bug)

develop
 ├── feature branches (feature/flight-number-lookup)
 ├── bugfix branches (bugfix/date-field-persistence)
 └── enhancement branches (enhancement/mobile-responsive-ui)
```

#### **Main Branch (`main`)**
- **Purpose:** Production-ready code
- **Status:** Always deployable
- **Protection Rules:**
  - Require pull request reviews (minimum 1 approver)
  - Require status checks to pass (tests, linting, build)
  - Dismiss stale PR approvals
  # Version Control Strategy — Short

  Purpose: concise Git workflow and conventions for `ayushanand29/Preflight-checklist`.

  Key points
  - Primary branches: `main` (production, protected) and `develop` (integration).
  - Use short-lived feature/bugfix branches from `develop` (e.g. `feature/...`, `bugfix/...`).
  - Use `release/*` for stabilizing releases and `hotfix/*` for urgent production fixes.

  Branching rules
  - Create feature branches from `develop` and open PRs back into `develop`.
  - Require PR reviews (min 1), passing CI checks, and up-to-date branches before merging.
  - Use squash-and-merge for features; use merge commits for `release/*` and `hotfix/*` merges to `main`.

  Commit messages
  - Follow Conventional Commits: `<type>(<scope>): <subject>` (e.g. `feat(frontend): add flight lookup`).
  - Common types: `feat`, `fix`, `docs`, `chore`, `test`, `ci`, `refactor`, `perf`.
  - Keep subjects short (≤50 chars), body optional; reference issues in footer (`Closes #42`).

  Pull Requests
  - Base PRs for features/bugfixes against `develop`; for releases/hotfixes use `main` as appropriate.
  - PR checklist: tests pass, linting passes, no console logs, documentation updated, descriptions + issue links.
  - Reviewer: check correctness, tests, and performance. Require at least one approval.

  Versioning & Releases
  - Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`.
  - Create `release/vX.Y.Z` from `develop`, test, then merge to `main` (tag) and back to `develop`.
  - Hotfixes: branch from `main`, merge back to `main` (tag) and `develop`.

  CI/CD expectations
  - Required status checks: backend tests, frontend tests, build.
  - Recommended: run `docker-compose build` in CI for the docker image step.

  Quick commands
  - Create feature branch:
    - `git checkout develop && git pull origin develop && git checkout -b feature/name`
  - Rebase on develop before push:
    - `git fetch origin && git rebase origin/develop && git push --force-with-lease`
  - Create release and tag:
    - `git checkout -b release/v1.0.0 && (bump versions) && git push origin release/v1.0.0`
    - Merge to `main`: `git merge --no-ff release/v1.0.0 && git tag -a v1.0.0 -m "Release v1.0.0" && git push --tags`

  Best practices (short)
  - Keep branches short-lived and focused. Commit often, but keep commits small and atomic.
  - Use Conventional Commits to enable automation (changelogs, release tooling).
  - Protect `main` and `develop` with branch protection and required checks.

  If you'd like, I can:
  - shorten further into a single one-paragraph cheat-sheet, or
  - produce a ready-to-use GitHub PR template and branch protection checklist to add to the repo.
When a user enters a flight number and blurs the field, the app now fetches
flight data from the backend and auto-populates all flight info fields.

- Map API response (flightDate) to state (date)
- Preserve user-entered flight number during fetch
- Show fetched data immediately in UI

Closes #42
```

```
fix(checklist): resolve dropdown state not updating after save

The status dropdown was not reflecting the saved value after an API response.
This was caused by the component not re-rendering after state update.

- Use controlled component pattern with value + onChange
- Ensure state setter is called before render

Fixes #67
```

```
docs(readme): add getting started guide

Include instructions for running frontend and backend locally,
as well as Docker deployment steps.
```

```
chore(deps): update axios to 1.6.0

Security patch for axios dependency to address vulnerability CVE-2024-1234.
No breaking changes; all functionality preserved.
```

### 3.3 Commit Best Practices

- **Atomic Commits:** Each commit should represent one logical change
  - ✅ Good: "Add flight number input field" + "Add auto-fetch on blur" (2 commits)
  - ❌ Avoid: "Implement entire flight info feature" (1 large commit)

- **Frequency:** Commit regularly (multiple times per day when actively developing)
  - Easier to review in PRs
  - Clearer history for debugging (git bisect)

- **Before Pushing:**
  ```bash
  git log --oneline origin/develop..HEAD
  # Review your commits; rebase if needed
  git diff origin/develop
  # Verify your changes
  ```

- **Rebase Before Merge:** Keep a clean, linear history
  ```bash
  git fetch origin
  git rebase origin/develop
  git push origin feature/my-feature --force-with-lease
  ```

---

## 4. Pull Request (PR) Workflow

### 4.1 Creating a Pull Request

1. **Push your branch to remote:**
   ```bash
   git push origin feature/flight-number-lookup
   ```

2. **Open PR on GitHub:**
   - Title: Follow commit convention: `feat(flight-info): add auto-lookup`
   - Description: Use PR template (see below)
   - Base branch: `develop` (for features) or `main` (for releases/hotfixes)
   - Link related issues: `Closes #42`

3. **PR Template (GitHub will auto-populate):**
   ```markdown
   ## Description
   Brief summary of changes.

   ## Related Issue
   Fixes #123

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Documentation update

   ## Testing
   How was this tested? Include steps to reproduce.

   ## Checklist
   - [ ] My code follows style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code (complex logic)
   - [ ] Tests pass locally
   - [ ] No console errors or warnings
   ```

### 4.2 PR Review Process

**Reviewer Responsibilities:**
- Code quality: Follows conventions, no code smells
- Logic: Correct implementation of requirements
- Tests: Adequate test coverage
- Documentation: Comments and README updated if needed
- Performance: No unnecessary re-renders, inefficient queries

**Approval Criteria:**
- At least 1 approval required (enforce via branch protection)
- All conversations resolved
- All status checks passing (tests, linting, build)

**Comments Format:**
```
# Good Review Comment
"This setState call doesn't need to be inside the map function. 
Move it outside to avoid performance issues."

# Suggestion vs. Blocker
SUGGESTION: "Consider using useMemo for this computation"
NEEDS CHANGE: "This breaks the API contract; flightNumber is required"
```

### 4.3 Merge Strategies

#### **For Feature/Bugfix Branches** → `develop`
- **Strategy:** Squash and merge
- **Benefit:** Clean develop history; each PR = one commit
- **Command:** Use GitHub UI or:
  ```bash
  git merge --squash feature/flight-number-lookup
  git commit -m "feat(flight-info): add auto-lookup on flight number blur"
  ```

#### **For Release Branches** → `main`
- **Strategy:** Merge commit (no squash)
- **Benefit:** Preserves release commits for traceability
- **Command:**
  ```bash
  git merge --no-ff release/v1.0.0
  ```

#### **For Release Branches** → `develop`
- **Strategy:** Merge commit (no squash)
- **Reason:** Keep develop and main in sync; preserve history

#### **For Hotfixes** → `main` and `develop`
- **Strategy:** Merge commit
- **Priority:** Must merge to both branches immediately
- **Tag:** Create tag on `main` after merge

### 4.4 Conflict Resolution

**When conflicts occur during PR:**

1. **On your local machine, sync with develop:**
   ```bash
   git fetch origin
   git rebase origin/develop
   # Resolve conflicts in editor
   git add .
   git rebase --continue
   ```

2. **Force-push to your branch:**
   ```bash
   git push origin feature/my-feature --force-with-lease
   ```

3. **Re-request review on GitHub** if you made changes

---

## 5. Versioning Strategy

We follow **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

### 5.1 Version Increment Rules

- **MAJOR** (v1.0.0 → v2.0.0): Breaking changes
  - Example: Changing API response format
  - Requires update to all consuming code

- **MINOR** (v1.0.0 → v1.1.0): New features, backward compatible
  - Example: Adding new optional API endpoint
  - Existing code continues to work

- **PATCH** (v1.0.0 → v1.0.1): Bug fixes, backward compatible
  - Example: Fixing data persistence issue
  - No new features

### 5.2 Version Tagging

**Tag Format:** `v{MAJOR}.{MINOR}.{PATCH}`

**When to tag:**
- After merge to `main` from `release/` or `hotfix/` branches
- Always include a changelog message

**Git commands:**
```bash
# Create annotated tag (recommended)
git tag -a v1.0.0 -m "Release v1.0.0: Flight info and checklist management"

# Push tag to remote
git push origin v1.0.0

# List tags
git tag -l

# Delete tag if needed
git tag -d v1.0.0
git push origin :v1.0.0
```

---

## 6. Collaboration Workflow: Day-to-Day

### 6.1 Developer Workflow

```bash
# 1. Create and switch to feature branch
git checkout develop
git pull origin develop
git checkout -b feature/flight-number-lookup

# 2. Work on feature (multiple commits)
git add src/App.jsx
git commit -m "feat(flight-info): add flight number input field"
git add src/utils/api.js
git commit -m "feat(flight-info): add flight lookup API call"

# 3. Push to remote (regularly)
git push origin feature/flight-number-lookup

# 4. Create Pull Request on GitHub (web UI)

# 5. During review: make requested changes
git add .
git commit -m "fix: resolve feedback on flight number mapping"
git push origin feature/flight-number-lookup

# 6. After approval: merge on GitHub
# (OR locally if preferred)
git checkout develop
git pull origin develop
git merge --squash feature/flight-number-lookup
git commit -m "feat(flight-info): add auto-lookup on flight number blur"
git push origin develop

# 7. Delete local and remote branch
git branch -d feature/flight-number-lookup
git push origin --delete feature/flight-number-lookup
```

### 6.2 Release Workflow

```bash
# 1. Create release branch when ready
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Update version in package.json files
# Edit frontend/package.json and backend/package.json
# Update version field to "1.0.0"
git add frontend/package.json backend/package.json
git commit -m "chore(release): bump version to 1.0.0"

# 3. Final testing on release branch
# Run tests, manual QA, etc.

# 4. Create PR to main for final review
git push origin release/v1.0.0

# 5. After approval, merge to main
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 6. Merge back to develop
git checkout develop
git pull origin develop
git merge --no-ff release/v1.0.0
git push origin develop

# 7. Delete release branch
git push origin --delete release/v1.0.0
git branch -d release/v1.0.0
```

### 6.3 Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-data-loss

# 2. Fix the critical bug
git add backend/server.js
git commit -m "fix(critical): resolve data loss on flight info save"

# 3. Create PR and get approval
git push origin hotfix/critical-data-loss

# 4. After approval, merge to main
git checkout main
git merge --no-ff hotfix/critical-data-loss
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical data loss fix"
git push origin main --tags

# 5. Merge to develop to keep in sync
git checkout develop
git pull origin develop
git merge --no-ff hotfix/critical-data-loss
git push origin develop

# 6. Delete hotfix branch
git push origin --delete hotfix/critical-data-loss
git branch -d hotfix/critical-data-loss
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Setup (`.github/workflows/`)

**File:** `.github/workflows/test-and-build.yml`

```yaml
name: Test and Build

on:
  push:
    branches: [develop, main, release/*, hotfix/*]
  pull_request:
    branches: [develop, main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
      - run: cd frontend && npm run build

  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose build
```

### 7.2 Required Status Checks

Branch protection rules enforce:
- ✅ Test suite passes
- ✅ Build succeeds
- ✅ Docker images build successfully
- ✅ Code coverage above 70% (if configured)

---

## 8. Issue Tracking & Labels

### 8.1 Issue Types

**GitHub Issue Labels:**

| Label | Color | Purpose |
|-------|-------|---------|
| `feature` | Green | New feature request |
| `bug` | Red | Bug report |
| `enhancement` | Blue | Improvement to existing feature |
| `documentation` | Purple | Documentation needed |
| `good first issue` | Light Green | Beginner-friendly task |
| `help wanted` | Orange | Seeking contributions |
| `urgent` | Dark Red | Critical priority |
| `in progress` | Yellow | Currently being worked on |
| `blocked` | Gray | Blocked by another issue |

### 8.2 Linking PRs to Issues

Use GitHub keywords in PR/commit messages to auto-link:

```
Fixes #123          → Closes issue #123
Closes #123         → Same as Fixes
Resolves #123       → Same as Fixes
Relates to #123     → Links without auto-closing
```

Example PR description:
```
## Description
Implements auto-lookup of flight data when user enters flight number.

Closes #42
Relates to #38 (upcoming UI improvements)
```

---

## 9. Code Review Checklist

**Reviewers must verify:**

- [ ] Code follows project style guide (ESLint, Prettier)
- [ ] Commit messages follow Conventional Commits format
- [ ] No console errors or `console.log` statements in production code
- [ ] Tests are added/updated for new features
- [ ] Documentation is updated (README, JSDoc comments)
- [ ] No hardcoded secrets or sensitive data
- [ ] API calls have proper error handling
- [ ] State updates are correct (no race conditions)
- [ ] Performance is acceptable (no unnecessary re-renders)
- [ ] Accessibility considered (labels, ARIA, keyboard nav)

---

## 10. Protected Branches Configuration

### 10.1 Main Branch Protection

**GitHub Settings → Branches → Branch protection rules**

```
Branch name pattern: main

Protect matching branches:
✅ Require a pull request before merging
   Require approvals: 1
   Dismiss stale pull request approvals when new commits are pushed
✅ Require status checks to pass before merging
   Required status checks: test, build, docker-build
✅ Require branches to be up to date before merging
✅ Require code reviews before merging
✅ Restrict who can push to matching branches
   Restrict pushes that create matching branches: Admins only
```

### 10.2 Develop Branch Protection

```
Branch name pattern: develop

Protect matching branches:
✅ Require a pull request before merging
   Require approvals: 1
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Allow force pushes: No
✅ Allow deletions: No
```

---

## 11. Best Practices Summary

| Practice | Benefit |
|----------|---------|
| Atomic, focused commits | Easier review and debugging |
| Conventional commit messages | Clear history and automation potential |
| Short-lived branches (< 1 week) | Reduce merge conflicts |
| Descriptive branch names | Self-documenting codebase |
| Squash-merge to develop | Clean history |
| Merge-commit for releases | Preserved release markers |
| Tag every release | Easy rollback and version tracking |
| Require PR reviews | Knowledge sharing and quality control |
| CI/CD checks enforce quality | No broken code in main |
| Keep develop stable | Safe base for feature branches |

---

## 12. Troubleshooting Common Scenarios

### Scenario: "I committed to main by accident"

```bash
# 1. Revert the commit
git revert HEAD

# 2. Push the revert
git push origin main

# 3. Create proper branch and redo via PR
git checkout -b feature/my-feature
# re-do your work
git push origin feature/my-feature
```

### Scenario: "My PR has conflicts with develop"

```bash
# 1. Fetch latest develop
git fetch origin

# 2. Rebase on develop
git rebase origin/develop

# 3. Resolve conflicts in editor
# 4. Stage resolved files
git add .

# 5. Continue rebase
git rebase --continue

# 6. Force-push to your branch
git push origin feature/my-feature --force-with-lease
```

### Scenario: "I need to undo a commit I pushed"

```bash
# 1. If not yet merged, revert
git revert COMMIT_HASH
git push origin feature/my-feature

# 2. If already merged to develop, create hotfix
git checkout -b hotfix/undo-bad-change
git revert MERGE_COMMIT_HASH
# Open PR to develop
```

---

## 13. Repository Health Metrics

**Monitor these metrics to ensure healthy collaboration:**

- **PR Review Time:** Target < 24 hours for initial review
- **Merge Frequency:** Feature branches merged every 1-3 days
- **Build Success Rate:** Target ≥ 95%
- **Test Coverage:** Target ≥ 70%
- **Issue Closure Rate:** Regular backlog grooming

**Monthly Review:**
1. Are PRs being reviewed promptly?
2. Are tests passing consistently?
3. Are commit messages clear and consistent?
4. Is the develop branch stable?
5. Are releases happening on schedule?

---

## 14. Quick Reference Commands

```bash
# Branch operations
git branch -a                           # List all branches
git checkout -b feature/name            # Create feature branch
git push origin feature/name            # Push to remote
git push origin --delete feature/name   # Delete remote branch

# Commit operations
git commit --amend                      # Edit last commit
git reset --soft HEAD~1                 # Undo last commit, keep changes
git revert COMMIT_HASH                  # Create inverse commit

# Sync operations
git fetch origin                        # Download remote changes
git pull origin develop                 # Fetch + merge
git rebase origin/develop               # Rebase on develop
git push origin feature/name --force-with-lease  # Safe force push

# Tag operations
git tag -a v1.0.0 -m "Release v1.0.0"  # Create annotated tag
git push origin v1.0.0                  # Push tag
git show v1.0.0                         # View tag details

# History inspection
git log --oneline -10                   # View last 10 commits
git log --graph --oneline --all         # Visual branch history
git diff origin/develop                 # Compare with develop
git show COMMIT_HASH                    # View commit details
```

---

## Conclusion

This Version Control Strategy ensures:
- ✅ **Clarity:** Clear branching and naming conventions
- ✅ **Traceability:** Comprehensive commit history and tagging
- ✅ **Quality:** Code reviews and CI/CD checks enforce standards
- ✅ **Collaboration:** Well-defined workflows for team coordination
- ✅ **Maintainability:** Easy rollback and debugging via clean history
- ✅ **Scalability:** Processes support growing team and codebase

All team members should familiarize themselves with this strategy and follow it consistently to maintain repository health and team efficiency.

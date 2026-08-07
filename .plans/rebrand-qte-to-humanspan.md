# Plan: Rebrand `qte` to `humanspan`

## Goal

Rename the package from `qte` to `humanspan` on npm and GitHub, with a clean
deprecation path for existing consumers.

## Current state

- npm package `qte` at version 0.1.1 (one release, low adoption risk).
- GitHub repository `adelrodriguez/qte`.
- `humanspan` is unclaimed on npm (verified 2026-08-06). The first choice, `spans`, was rejected by the npm similarity filter at publish time.
- References to the old name exist in: `package.json`, `README.md`,
  `CONTEXT.md`, `CHANGELOG.md`, `AGENTS.md`, `docs/agents/issue-tracker.md`.
- No references in `src/`, `scripts/`, or `.github/workflows/`.

## Steps

### 1. Claim the name

- [ ] Publish a placeholder or the real package as `humanspan` as soon as
      possible. Names on npm are first come, first served.

### 2. Rename the GitHub repository

- [ ] Rename `adelrodriguez/qte` to `adelrodriguez/humanspan` in the GitHub
      settings. GitHub redirects the old URL, so existing links and clones
      continue to work.
- [ ] Update the local git remote:
      `git remote set-url origin git@github.com:adelrodriguez/humanspan.git`

### 3. Update the codebase

- [ ] `package.json`: change `name`, `homepage`, `bugs.url`, and
      `repository.url` to use `humanspan`.
- [ ] `README.md`: update the title, badges (npm version, pkg-size, license),
      install commands, and all import examples.
- [ ] `CONTEXT.md`: change the title and package-name references. Update the
      **Package consumer** definition.
- [ ] `CHANGELOG.md`: change the top-level heading. Keep old entries as
      history.
- [ ] `AGENTS.md` and `docs/agents/issue-tracker.md`: change the issue
      tracker reference to `adelrodriguez/humanspan`.
- [ ] Search the repository for remaining `qte` references:
      `rg -i qte --hidden -g '!node_modules' -g '!.git'`

### 4. Verify

- [ ] Run `bun run check`, `bun run format`, `bun run analyze`, `bun test`,
      and `bun run build`.
- [ ] Inspect the built `dist/` output for stale name references.

### 5. Release `humanspan`

- [ ] Create a changeset (minor bump) that documents the rename.
- [ ] Publish `humanspan` at the next version through the normal release flow
      (`changeset version`, `changeset publish`).
- [ ] Confirm the npm page renders the README and badges correctly.

### 6. Deprecate `qte`

- [ ] Publish one final `qte` version whose README points to `humanspan`.
      Optional: make it re-export from `humanspan` so old installs keep working.
- [ ] Run
      `npm deprecate qte "This package moved to 'humanspan'. Install 'humanspan' instead."`
- [ ] Do not unpublish `qte`; deprecation keeps existing consumers safe.

## Risks

- **Name sniping**: `humanspan` can be claimed by someone else before step 1.
  Mitigate by claiming the name first.
- **npm spam filters**: an empty placeholder package can be flagged. Publish
  a functional version instead of an empty one if possible.
- **Badge caches**: shields.io and pkg-size badges can show stale data for a
  short time after the first `humanspan` release. No action needed.

## Out of scope

- No API changes. Exports, types, and behavior stay the same.
- No major version bump; the package is below 1.0.0 and the rename is not a
  code change.

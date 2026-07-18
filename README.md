# Ever Works — Works catalog

> **Status: index.** This repo doesn't ship Work bodies — those already
> live in dedicated template repos (`directory-web-template`,
> `directory-web-minimal-template`, etc.). It ships `manifest.json`,
> which indexes them, pins their defaults, and names the conventions.
> Shapes whose builders aren't public yet are listed with
> `status: placeholder` and a null template repo.

This repository will be the **canonical index of Work blueprints**
for the [Ever Works](https://ever.works) platform. A *Work blueprint*
describes one shape a Work can take — what it is, which template
repo to fork from, what providers to wire up by default, what
follow-up Mission to suggest after it's built.

## What "Works" are in Ever Works

A `Work` is the actual built artifact — a directory, a company site,
a store, a blog, a desktop app. The platform's entity
(`packages/agent/src/entities/work.entity.ts`) tracks its providers
(`gitProvider`, `storageProvider`, `deployProvider`) and its shape
(`kind`, `organization`). The *body* of the Work lives in its own
git repo — created by forking the appropriate **template repo**.

The catalog of template repos already exists:

- [`ever-works/directory-web-template`](https://github.com/ever-works/directory-web-template)
  — the standard Next.js directory site.
- [`ever-works/directory-web-minimal-template`](https://github.com/ever-works/directory-web-minimal-template)
  — the minimal Astro directory.
- [`ever-works/ever-works-website-template`](https://github.com/ever-works/ever-works-website-template)
  — the marketing-site shape.

This repo doesn't duplicate any of that. It exists to:

1. **List the available blueprints** in a machine-readable manifest
   so the Workshop's "Create Work" wizard can render them as cards
   without each release of the platform redeploying.
2. **Pin the defaults** per blueprint — provider stack, suggested
   Agents, suggested Mission, what fields the user is asked for in
   the wizard.
3. **Track the lifecycle conventions** — what `kind` it is, whether
   it's an `organization`, what its publishing surface looks like.

## What lives here

```
manifest.json                       # the catalog — hand-authored blueprint pointers
schema/
  works-manifest.schema.json        # JSON Schema (draft 2020-12) for manifest.json
scripts/
  validate.mjs                      # schema + cross-field rules (CI gate)
.github/workflows/validate.yml      # runs validate.mjs on push/PR
```

Each blueprint entry references an upstream template repo by
`repo` + `ref`/`sha` and pins per-shape defaults. The Work entity's
`storageProvider` / `deployProvider` defaults stay the source of
truth; blueprints only override per-shape.

## Catalog

<!-- catalog:start -->
| Slug | Blueprint | Kind | Chip | Status | Template repo |
| --- | --- | --- | --- | --- | --- |
| `directory` | Directory Website | DIRECTORY | directory | production | [`ever-works/directory-web-template`](https://github.com/ever-works/directory-web-template) ⭐ default |
| `directory-minimal` | Minimal Directory Website | DIRECTORY | directory | production | [`ever-works/directory-web-minimal-template`](https://github.com/ever-works/directory-web-minimal-template) |
| `marketing-site` | Marketing Website | DEFAULT | marketing | production | [`ever-works/ever-works-website-template`](https://github.com/ever-works/ever-works-website-template) ⭐ default |
| `company` | Company Website | COMPANY | company | placeholder | — (Company builder in flight) |
| `store` | eCommerce Store | STORE | store | placeholder | — (Store builder in flight) |
| `blog` | Blog Website | BLOG | blog | placeholder | — |
| `landing-page` | Landing Page | LANDING | landing | placeholder | — |
| `awesome` | Awesome List Website | AWESOME | awesome | placeholder | — |
<!-- catalog:end -->

`⭐ default` marks the blueprint the wizard pre-selects for its chip
family. Exactly one `default: true` is allowed per `chipType`.

## How the platform consumes this

The Workshop's "Create Work" wizard reads `manifest.json` and renders
one card per blueprint — no platform release needed to add a shape.
When the user picks a blueprint:

1. **`manifest.json` → blueprint entry.** The wizard looks up the
   chosen `slug` and reads its `kind`, `chipType`, `isOrganization`,
   and `template`.
2. **Fork `template.repo`.** For a `production` blueprint the platform
   forks (or generates-from-template, when `isGitHubTemplate: true`)
   the referenced `ever-works/<name>` repo at `template.sha ?? template.ref`
   to create the Work body.
3. **Stamp the Work.** `Work.kind` and `Work.organization` are set from
   the blueprint; provider defaults on the Work entity stay the source
   of truth and are only overridden per-shape.

Blueprints with `status: placeholder` carry a null `template.repo`, so
the catalog can list a shape (and reserve its chip) before the builder
and its template repo are public — the wizard gates them out of the
production create flow.

## Why this repo even exists

Without it the platform would need a **hardcoded list** of blueprint
defaults — slugs, template URLs, provider stacks, wizard fields. That
list would drift the moment we add a new blueprint, and changing it
would require a platform release. Putting the index in its own repo
keeps the wizard's content layer separate from its code layer.

## What's still placeholder

1. **The production blueprints are live** — `directory`,
   `directory-minimal`, and `marketing-site` point at real
   `ever-works/*` template repos.
2. **The Company / Store / Blog / Landing / Awesome builders are
   mid-flight.** Their shapes are listed with `status: placeholder`
   and a null template repo so the catalog reserves the chip without
   pointing at a not-yet-public template repo.
3. **The blueprint schema may still evolve** — it is likely to take
   its final shape alongside the unified Workshop Templates catalog.

## Contributing

Add or edit a blueprint entry in `manifest.json`, then run the
validator locally:

```
npm install
npm run validate     # node scripts/validate.mjs
```

The same check runs in CI on every push and pull request
(`.github/workflows/validate.yml`). The validator enforces the schema
plus slug uniqueness, exactly one `default: true` per `chipType`, and
the status/template-repo coupling (placeholder ⇒ repo may be null;
production/beta ⇒ an `ever-works/<name>` repo is required).

## License

This repo (catalog) content is [Apache-2.0](LICENSE) licensed.  
Each template repo has own license, see LICENSE/LICENSE.md files inside template repos.

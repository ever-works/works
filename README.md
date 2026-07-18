# Ever Works — Works catalog

> **Status: index-only.** This repo doesn't ship Work bodies — those
> already live in dedicated template repos (`directory-web-template`,
> `directory-web-minimal-template`, etc.). It indexes them, names the
> conventions, and reserves the slug.

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

## What lives here (planned)

```
schema/
  work-blueprint.schema.json
blueprints/
  directory/
    blueprint.yml             # template repo, providers, fields, mission
    README.md
  directory-minimal/
  marketing-site/
  company/
  store/                      # placeholder until Store builder ships
  desktop-app/                # placeholder until Desktop ships
manifest.json
```

Each `blueprint.yml` would reference an upstream template repo by
URL/SHA and pin the wizard defaults. The Work entity's
`storageProvider` / `deployProvider` defaults stay the source of
truth; blueprints only override per-shape.

## Initial blueprints we expect to land here first

| Slug | Template repo | Status |
|---|---|---|
| `directory` | `ever-works/directory-web-template` | Production. |
| `directory-minimal` | `ever-works/directory-web-minimal-template` | Production. |
| `marketing-site` | `ever-works/ever-works-website-template` | Production. |
| `company` | TBD | Builder UX in flight (PR #1123 docs). |
| `store` | TBD | Builder UX in flight (PR #1123 docs). |

## Why this repo even exists

Without it the platform would need a **hardcoded list** of blueprint
defaults — slugs, template URLs, provider stacks, wizard fields. That
list would drift the moment we add a new blueprint, and changing it
would require a platform release. Putting the index in its own repo
keeps the wizard's content layer separate from its code layer.

## Why nothing ships yet

1. **The wizard already knows about the production template repos.**
   No regression to fix.
2. **The Company / Store builders are mid-flight.** We
   don't want to publish a stub blueprint that points at a
   not-yet-public template repo.
3. **The blueprint schema is still in flux** — it will likely take
   its final shape alongside ADR-010 (the unified Workshop Templates
   catalog).

## How to follow along

- The actual template repos (`directory-web-template` etc.) keep
  shipping on their own cadence.
- When this repo's first `blueprint.yml` lands, that's the signal the
  Work-blueprint loader has a real consumer in the platform.

## License

This repo (catalog) content is [Apache-2.0](LICENSE) licensed.  
Each template repo has own license, see LICENSE/LICENSE.md files inside template repos.

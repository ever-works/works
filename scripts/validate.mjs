#!/usr/bin/env node
// Validates manifest.json against the works-manifest schema and this repo's
// cross-field rules: slug uniqueness, exactly one default per chipType, and the
// status/template.repo coupling (placeholder ⇒ repo may be null; production &
// beta ⇒ repo required and owned by ever-works). Exits non-zero on any error.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// The schema is JSON Schema draft 2020-12, so use Ajv's 2020 build (the default
// `ajv` export only bundles the draft-07 meta-schema).
import Ajv from 'ajv/dist/2020.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REPO_RE = /^ever-works\/[a-z0-9-]+$/;

const errors = [];
const err = (slug, msg) => errors.push(slug ? `[${slug}] ${msg}` : msg);

// ---- load manifest + schema ----
const manifestPath = join(ROOT, 'manifest.json');
const schemaPath = join(ROOT, 'schema', 'works-manifest.schema.json');
if (!existsSync(manifestPath)) {
	err(null, 'manifest.json missing');
}
if (!existsSync(schemaPath)) {
	err(null, 'schema/works-manifest.schema.json missing');
}
if (errors.length) fail();

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

// ---- JSON Schema validation ----
const ajv = new Ajv({ allErrors: true });
if (!ajv.validate(schema, manifest)) {
	err(null, `manifest.json schema errors: ${ajv.errorsText(ajv.errors)}`);
}

const blueprints = Array.isArray(manifest.blueprints) ? manifest.blueprints : [];
if (blueprints.length === 0) err(null, 'manifest.json has no blueprints');

// ---- slug uniqueness ----
const seen = new Set();
for (const b of blueprints) {
	if (!b || typeof b.slug !== 'string') continue;
	if (seen.has(b.slug)) err(b.slug, 'duplicate slug');
	seen.add(b.slug);
}

// ---- exactly one default:true per chipType ----
const defaultsByChip = new Map();
for (const b of blueprints) {
	if (!b || typeof b.chipType !== 'string') continue;
	if (!defaultsByChip.has(b.chipType)) defaultsByChip.set(b.chipType, 0);
	if (b.default === true) defaultsByChip.set(b.chipType, defaultsByChip.get(b.chipType) + 1);
}
for (const [chipType, count] of defaultsByChip) {
	if (count !== 1) {
		err(null, `chipType "${chipType}" must have exactly one default:true blueprint, found ${count}`);
	}
}

// ---- status/template.repo coupling ----
for (const b of blueprints) {
	if (!b || typeof b.slug !== 'string') continue;
	const repo = b.template?.repo ?? null;
	if (b.status === 'placeholder') {
		// repo-null is allowed; if present it must still be well-formed.
		if (repo !== null && !REPO_RE.test(repo)) {
			err(b.slug, `placeholder template.repo "${repo}" must be null or match ^ever-works/<name>$`);
		}
	} else {
		// production | beta ⇒ repo required and owned by ever-works.
		if (repo === null) {
			err(b.slug, `status "${b.status}" requires a non-null template.repo`);
		} else if (!REPO_RE.test(repo)) {
			err(b.slug, `template.repo "${repo}" must match ^ever-works/<name>$`);
		}
	}
}

if (errors.length) fail();

const summary = blueprints
	.map((b) => `${b.slug} (${b.status}${b.default ? ', default' : ''})`)
	.join(', ');
console.log(`✓ ${blueprints.length} blueprints valid: ${summary}`);

function fail() {
	console.error(`✗ validation failed with ${errors.length} error(s):\n` + errors.map((e) => `  - ${e}`).join('\n'));
	process.exit(1);
}

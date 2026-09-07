/**
 * Bumps the workspace to the latest Effect 4 prerelease.
 *
 * Weft tracks Effect 4's prerelease line (published on npm as `effect` under
 * the `beta` and, since 4.0.0-rc.108, the `rc` dist-tag; there is no
 * `effect-smol` package). The workspace catalog pins one exact prerelease (the
 * "tested floor"); the published packages accept `>=<floor> <4.0.0` as their
 * peer range. This script advances that floor:
 *
 *   1. reads the `rc` and `beta` dist-tags from the npm registry and picks the
 *      newest `4.0.0-<beta|rc>.N` (prerelease numbers are shared across both
 *      tags, so the highest N wins),
 *   2. rewrites the exact pin in `pnpm-workspace.yaml`'s catalog,
 *   3. rewrites the peer-range floor in each published package's package.json,
 *   4. rewrites the `effect@4.0.0-<tag>.N` "tested against" token in the docs
 *      that state it (READMEs + tutorial install pages), and the `effect@<tag>`
 *      install token when the bump crosses from `beta` to `rc`.
 *
 * Only `4.0.0-beta.N` / `4.0.0-rc.N` versions are accepted. A stable `4.0.0`
 * (or anything else) on those tags is refused so the jump off the prerelease
 * line stays a human decision.
 *
 * Run `node scripts/bump-effect-beta.mjs` (add `--dry-run` to preview).
 * Exits 0 with no changes when already on the latest prerelease. When
 * `$GITHUB_OUTPUT` is set, writes `updated=<bool>` and `version=<new>` for the
 * effect-beta-bump workflow. After a real bump, run
 * `vp install --no-frozen-lockfile` to refresh the lockfile, then
 * `vp run check` / `vp run test`.
 */

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const isDryRun = process.argv.includes("--dry-run");

/** Published packages whose peer-range floor tracks the tested prerelease. */
const PEER_PACKAGES = ["core", "dom", "router"];
/** Docs stating the "tested against `effect@4.0.0-<tag>.N`" version and the `effect@<tag>` install command. */
const DOC_FILES = [
  "README.md",
  "packages/core/README.md",
  "packages/dom/README.md",
  "packages/router/README.md",
  "docs/tutorial/01-your-first-app.md",
];
/** Dist-tags carrying Effect 4 prereleases, newest line first. */
const PRERELEASE_TAGS = ["rc", "beta"];
const PRERELEASE_RE = /^4\.0\.0-(beta|rc)\.(\d+)$/;

/** Parses `4.0.0-<tag>.N` into its tag and number, or null when not a prerelease. */
function parsePrerelease(version) {
  const match = typeof version === "string" ? version.match(PRERELEASE_RE) : null;
  return match ? { version, tag: match[1], n: Number(match[2]) } : null;
}

function writeGithubOutput(updated, version) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `updated=${updated}\nversion=${version}\n`);
  }
}

const workspacePath = resolve(root, "pnpm-workspace.yaml");
const workspaceYaml = readFileSync(workspacePath, "utf8");
const currentMatch = workspaceYaml.match(/^(\s*)effect: (\S+)$/m);
if (!currentMatch) throw new Error("no `effect:` entry found in pnpm-workspace.yaml catalog");
const current = parsePrerelease(currentMatch[2]);
if (!current) {
  throw new Error(
    `catalog pins effect@${currentMatch[2]}, not a 4.0.0-beta.N / 4.0.0-rc.N version — refusing to bump`,
  );
}

const response = await fetch("https://registry.npmjs.org/-/package/effect/dist-tags");
if (!response.ok)
  throw new Error(`registry request failed: ${response.status} ${response.statusText}`);
const distTags = await response.json();
const candidates = PRERELEASE_TAGS.map((tag) => parsePrerelease(distTags[tag])).filter(Boolean);
if (candidates.length === 0) {
  const seen = PRERELEASE_TAGS.map((tag) => `${tag}=${distTags[tag]}`).join(", ");
  throw new Error(
    `no 4.0.0-beta.N / 4.0.0-rc.N version on npm dist-tags (${seen}), refusing to bump`,
  );
}
// Prerelease numbers are shared across the beta and rc lines; on a tie the newer line (rc) wins.
const latest = candidates.reduce((best, c) =>
  c.n > best.n || (c.n === best.n && c.tag === PRERELEASE_TAGS[0]) ? c : best,
);

if (latest.n <= current.n) {
  console.log(`already on the latest prerelease (effect@${current.version}); nothing to do`);
  writeGithubOutput(false, current.version);
  process.exit(0);
}

console.log(`bumping effect ${current.version} → ${latest.version}${isDryRun ? " (dry run)" : ""}`);

/** Applies `edit` to `path`, throwing if it changed nothing (a silent no-op means drift). */
function rewrite(path, edit) {
  const before = readFileSync(resolve(root, path), "utf8");
  const after = edit(before);
  if (after === before) throw new Error(`${path}: expected content to rewrite was not found`);
  if (!isDryRun) writeFileSync(resolve(root, path), after);
  console.log(`  ${path}`);
}

rewrite("pnpm-workspace.yaml", (s) => s.replace(/^(\s*effect): \S+$/m, `$1: ${latest.version}`));
for (const name of PEER_PACKAGES) {
  rewrite(`packages/${name}/package.json`, (s) =>
    s.replace(`"effect": ">=${current.version} <4.0.0"`, `"effect": ">=${latest.version} <4.0.0"`),
  );
}
for (const path of DOC_FILES) {
  rewrite(path, (s) =>
    s
      .replaceAll(`effect@${current.version}`, `effect@${latest.version}`)
      // Install command `npm install ... effect@<tag>`: follow the line so the tag installs >= floor.
      .replaceAll(new RegExp(`effect@${current.tag}(?![\\w.-])`, "g"), `effect@${latest.tag}`),
  );
}

writeGithubOutput(!isDryRun, latest.version);
console.log(
  isDryRun
    ? "dry run — no files written"
    : "done — run `vp install --no-frozen-lockfile`, then `vp run check` and `vp run test`",
);

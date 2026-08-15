"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const lib = require("../../dist/index.js");

const CLI = path.join(__dirname, "..", "..", "dist", "cli.js");

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
}

function ok(args) {
  const result = run(args);
  assert.strictEqual(result.status, 0, `expected exit 0, got ${result.status}: ${result.stderr}`);
  return result.stdout.trim();
}

test("two digit-syntax dates", () => {
  assert.strictEqual(ok(["8-24-26", "11-22-26"]), "2 months 29 days");
  assert.strictEqual(ok(["8/24/26", "11/22/26"]), "2 months 29 days");
  assert.strictEqual(ok(["08.24.26", "11/22/26"]), "2 months 29 days");
  assert.strictEqual(ok(["8,24,1926", "11;22;26"]), "100 years 2 months 29 days");
});

test("two quoted stringed dates", () => {
  assert.strictEqual(ok(["August 24 2026", "November 22 2026"]), "2 months 29 days");
});

test("mixed digit and stringed dates", () => {
  assert.strictEqual(ok(["8-24-26", "November 22 2026"]), "2 months 29 days");
});

test("date plus days prints the resulting date", () => {
  assert.strictEqual(ok(["8-24-26", "90"]), "November, 22 2026");
  assert.strictEqual(ok(["August 24 2026", "90"]), "November, 22 2026");
});

test("unquoted single date compares against today", () => {
  const today = new Date();
  const expected = lib.formatDuration(lib.diffDates(lib.parseDate("August 24 2026", today), today));
  assert.strictEqual(ok(["August", "24", "2026"]), expected);
});

test("month with a date joins into one date", () => {
  const today = new Date();
  const expected = lib.formatDuration(lib.diffDates(lib.parseDate("August 24", today), today));
  assert.strictEqual(ok(["August", "24"]), expected);
});

test("sigil month and end-of-month forms", () => {
  const today = new Date();
  const first = lib.formatDuration(lib.diffDates(lib.parseDate("_8", today), today));
  const last = lib.formatDuration(lib.diffDates(lib.parseDate("8_", today), today));
  assert.strictEqual(ok(["_8"]), first);
  assert.strictEqual(ok(["_August"]), first);
  assert.strictEqual(ok(["August"]), first);
  assert.strictEqual(ok(["8_"]), last);
  assert.strictEqual(ok(["August_"]), last);
  assert.strictEqual(ok(["Auguste"]), last);
  assert.strictEqual(ok(["August", "e"]), last);
  assert.strictEqual(ok(["August", "-e"]), last);
});

test("underscore keeps working as an interior separator", () => {
  assert.strictEqual(ok(["8_24_26", "11_22_26"]), "2 months 29 days");
});

test("verbose flag forces all duration groups", () => {
  assert.strictEqual(ok(["--verbose", "8-24-26", "11-22-26"]), "0 years 2 months 29 days");
  assert.strictEqual(ok(["-v", "8-24-26", "11-22-26"]), "0 years 2 months 29 days");
});

test("unit flags report the duration in a single unit", () => {
  assert.strictEqual(ok(["-d", "8-24-26", "11-22-26"]), "90 days");
  assert.strictEqual(ok(["--days", "8-24-26", "11-22-26"]), "90 days");
  assert.strictEqual(ok(["-m", "8-24-26", "11-22-26"]), "2.94 months");
  assert.strictEqual(ok(["--months", "8-24-26", "11-22-26"]), "2.94 months");
  assert.strictEqual(ok(["-y", "8-24-26", "11-22-26"]), "0.25 years");
  assert.strictEqual(ok(["--years", "8,24,1926", "11;22;26"]), "100.25 years");
});

test("the last unit flag wins and unit beats verbose", () => {
  assert.strictEqual(ok(["-m", "-d", "8-24-26", "11-22-26"]), "90 days");
  assert.strictEqual(ok(["-v", "-d", "8-24-26", "11-22-26"]), "90 days");
});

test("unit flags leave date output untouched", () => {
  assert.match(ok(["-d", "100"]), /^[A-Z][a-z]+, \d{2} \d{4}$/);
  assert.match(ok(["-m", "8-24-26", "90"]), /^[A-Z][a-z]+, \d{2} \d{4}$/);
});

test("version flag prints the version", () => {
  assert.match(ok(["--version"]), /^3\.0\.0$/);
});

test("help flag prints usage", () => {
  assert.match(ok(["--help"]), /Usage: datecal/);
});

test("invalid input exits with an error", () => {
  for (const args of [["13-1-1"], ["February 30 2026"], ["8*24*26"], ["notadate"]]) {
    const result = run(args);
    assert.strictEqual(result.status, 1, `expected exit 1 for ${args.join(" ")}`);
    assert.match(result.stderr, /Error:/);
  }
});

test("misplaced sigils and removed forms exit with a clean error", () => {
  for (const args of [["_8_24_26"], ["8_24_26_"], ["8:e"], ["8-e"], ["_8_"], ["_13"]]) {
    const result = run(args);
    assert.strictEqual(result.status, 1, `expected exit 1 for ${args.join(" ")}`);
    assert.match(result.stderr, /^Error:/);
  }
});

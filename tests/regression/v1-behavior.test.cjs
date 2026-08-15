"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { dateCal } = require("../../dist/index.js");

const CLI = path.join(__dirname, "..", "..", "dist", "cli.js");

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
}

// The v1 implementation: add days to today and format as "Month, DD YYYY".
function v1Expected(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}, ${day} ${year}`;
}

test("dateCal(days) still returns a date relative to today", () => {
  assert.strictEqual(dateCal(10), v1Expected(10));
  assert.strictEqual(dateCal(0), v1Expected(0));
  assert.strictEqual(dateCal(-10), v1Expected(-10));
  assert.strictEqual(dateCal(365), v1Expected(365));
});

test("dateCal(days) delegation matches the v1 output format byte for byte", () => {
  assert.strictEqual(dateCal(8), v1Expected(8));
  assert.strictEqual(dateCal(-8), v1Expected(-8));
});

test("CLI restores day-offset behavior for every bare integer", () => {
  for (const days of [1, 8, 12, 100, 365, -8, -10, 13]) {
    const result = run([String(days)]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.trim(), v1Expected(days));
  }
});

test("negative integers pass the flag parser, with and without --", () => {
  for (const args of [["-8"], ["--", "-8"]]) {
    const result = run(args);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.trim(), v1Expected(-8));
  }
});

test("CLI help still exits 0 and prints usage", () => {
  for (const flag of ["--help", "-h"]) {
    const result = run([flag]);
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Usage: datecal/);
  }
});

test("CLI with no arguments prints usage and exits 0", () => {
  const result = run([]);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /Usage: datecal/);
});

test("CLI still exits 1 on unparseable input", () => {
  const result = run(["abc"]);
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /Error:/);
});

test("date output format is unchanged from v1", () => {
  assert.match(dateCal(10), /^[A-Z][a-z]+, \d{2} \d{4}$/);
});

"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { dateCal } = require("../../dist/index.js");

// Fixed reference date so tests are deterministic: August 14, 2026.
const TODAY = { year: 2026, month: 8, day: 14 };

test("two dates return the duration between them", () => {
  assert.strictEqual(dateCal("August 24 2026", "November 22 2026"), "2 months 29 days");
  assert.strictEqual(dateCal("8-24-26", "11-22-26"), "2 months 29 days");
  assert.strictEqual(dateCal("8,24,1926", "11;22;26"), "100 years 2 months 29 days");
});

test("one date returns the duration from today", () => {
  assert.strictEqual(dateCal("August 24 2026", { today: TODAY }), "10 days");
  assert.strictEqual(dateCal("August 24 26", { today: TODAY }), "10 days");
  assert.strictEqual(dateCal("August", { today: TODAY }), "13 days");
  assert.strictEqual(dateCal("8", { today: TODAY }), "13 days");
  assert.strictEqual(dateCal("Auguste", { today: TODAY }), "17 days");
  assert.strictEqual(dateCal("August e", { today: TODAY }), "17 days");
  assert.strictEqual(dateCal("8:e", { today: TODAY }), "17 days");
});

test("a past date returns a positive duration", () => {
  assert.strictEqual(dateCal("August 24 1926", { today: TODAY }), "99 years 11 months 21 days");
});

test("a date plus days returns the resulting date", () => {
  assert.strictEqual(dateCal("8-24-26", 90), "November, 22 2026");
  assert.strictEqual(dateCal("8-24-26", 100), "December, 02 2026");
  assert.strictEqual(dateCal("8-24-26", -10), "August, 14 2026");
});

test("a number of days returns the date relative to today", () => {
  assert.strictEqual(dateCal(10, { today: TODAY }), "August, 24 2026");
  assert.strictEqual(dateCal(0, { today: TODAY }), "August, 14 2026");
  assert.strictEqual(dateCal(-14, { today: TODAY }), "July, 31 2026");
});

test("verbose option always shows all duration groups", () => {
  assert.strictEqual(dateCal("August 24 2026", { today: TODAY, verbose: true }), "0 years 0 months 10 days");
  assert.strictEqual(dateCal("8-24-26", "11-22-26", { verbose: true }), "0 years 2 months 29 days");
});

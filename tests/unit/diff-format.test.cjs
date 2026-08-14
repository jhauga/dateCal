"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const {
  diffDates,
  formatDuration,
  formatDate,
  addDays,
  daysInMonth,
  isLeapYear,
} = require("../../dist/index.js");

test("diffDates counts months then leftover days", () => {
  const result = diffDates({ year: 2026, month: 8, day: 24 }, { year: 2026, month: 11, day: 22 });
  assert.deepStrictEqual(result, { years: 0, months: 2, days: 29 });
});

test("diffDates is order-independent", () => {
  const result = diffDates({ year: 2026, month: 11, day: 22 }, { year: 2026, month: 8, day: 24 });
  assert.deepStrictEqual(result, { years: 0, months: 2, days: 29 });
});

test("diffDates spans years", () => {
  const result = diffDates({ year: 1926, month: 8, day: 24 }, { year: 2026, month: 11, day: 22 });
  assert.deepStrictEqual(result, { years: 100, months: 2, days: 29 });
});

test("diffDates handles short-month boundaries", () => {
  const result = diffDates({ year: 2024, month: 1, day: 31 }, { year: 2024, month: 3, day: 1 });
  assert.deepStrictEqual(result, { years: 0, months: 1, days: 1 });
});

test("diffDates of the same date is zero", () => {
  const result = diffDates({ year: 2026, month: 8, day: 14 }, { year: 2026, month: 8, day: 14 });
  assert.deepStrictEqual(result, { years: 0, months: 0, days: 0 });
});

test("diffDates counts whole years", () => {
  const result = diffDates({ year: 2023, month: 2, day: 28 }, { year: 2024, month: 2, day: 28 });
  assert.deepStrictEqual(result, { years: 1, months: 0, days: 0 });
});

test("formatDuration drops leading zero groups by default", () => {
  assert.strictEqual(formatDuration({ years: 0, months: 0, days: 10 }), "10 days");
  assert.strictEqual(formatDuration({ years: 0, months: 2, days: 29 }), "2 months 29 days");
  assert.strictEqual(formatDuration({ years: 100, months: 2, days: 29 }), "100 years 2 months 29 days");
  assert.strictEqual(formatDuration({ years: 0, months: 0, days: 0 }), "0 days");
});

test("formatDuration uses singular units", () => {
  assert.strictEqual(formatDuration({ years: 0, months: 0, days: 1 }), "1 day");
  assert.strictEqual(formatDuration({ years: 0, months: 1, days: 0 }), "1 month 0 days");
  assert.strictEqual(formatDuration({ years: 1, months: 0, days: 0 }), "1 year 0 months 0 days");
});

test("formatDuration verbose always shows all groups", () => {
  assert.strictEqual(formatDuration({ years: 0, months: 0, days: 10 }, true), "0 years 0 months 10 days");
});

test("formatDate matches the Month, DD YYYY format", () => {
  assert.strictEqual(formatDate({ year: 2026, month: 11, day: 22 }), "November, 22 2026");
  assert.strictEqual(formatDate({ year: 2026, month: 3, day: 1 }), "March, 01 2026");
});

test("addDays crosses month and year boundaries", () => {
  assert.deepStrictEqual(addDays({ year: 2026, month: 8, day: 24 }, 90), { year: 2026, month: 11, day: 22 });
  assert.deepStrictEqual(addDays({ year: 2026, month: 12, day: 31 }, 1), { year: 2027, month: 1, day: 1 });
  assert.deepStrictEqual(addDays({ year: 2026, month: 8, day: 14 }, -14), { year: 2026, month: 7, day: 31 });
});

test("addDays crosses leap day correctly", () => {
  assert.deepStrictEqual(addDays({ year: 2024, month: 2, day: 28 }, 1), { year: 2024, month: 2, day: 29 });
  assert.deepStrictEqual(addDays({ year: 2026, month: 2, day: 28 }, 1), { year: 2026, month: 3, day: 1 });
});

test("daysInMonth handles 30-day months and February", () => {
  assert.strictEqual(daysInMonth(9, 2026), 30);
  assert.strictEqual(daysInMonth(4, 2026), 30);
  assert.strictEqual(daysInMonth(6, 2026), 30);
  assert.strictEqual(daysInMonth(11, 2026), 30);
  assert.strictEqual(daysInMonth(8, 2026), 31);
  assert.strictEqual(daysInMonth(2, 2026), 28);
  assert.strictEqual(daysInMonth(2, 2024), 29);
});

test("isLeapYear follows the century rules", () => {
  assert.strictEqual(isLeapYear(2024), true);
  assert.strictEqual(isLeapYear(2026), false);
  assert.strictEqual(isLeapYear(2000), true);
  assert.strictEqual(isLeapYear(1900), false);
});

"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { parseDate, DateCalError } = require("../../dist/index.js");

// Fixed reference date so tests are deterministic: August 14, 2026.
const TODAY = { year: 2026, month: 8, day: 14 };

test("stringed syntax with full month, date, and 4-digit year", () => {
  assert.deepStrictEqual(parseDate("August 24 2026", TODAY), { year: 2026, month: 8, day: 24 });
});

test("stringed syntax with 2-digit year", () => {
  assert.deepStrictEqual(parseDate("August 24 26", TODAY), { year: 2026, month: 8, day: 24 });
});

test("abbreviated month with trailing period", () => {
  assert.deepStrictEqual(parseDate("Aug. 24 26", TODAY), { year: 2026, month: 8, day: 24 });
  assert.deepStrictEqual(parseDate("Sept. 3 2026", TODAY), { year: 2026, month: 9, day: 3 });
});

test("month names are case-insensitive", () => {
  assert.deepStrictEqual(parseDate("august 24 2026", TODAY), { year: 2026, month: 8, day: 24 });
  assert.deepStrictEqual(parseDate("JUNE 5", TODAY), { year: 2026, month: 6, day: 5 });
});

test("digit syntax with common separators", () => {
  const expected = { year: 2026, month: 8, day: 24 };
  assert.deepStrictEqual(parseDate("8-24-26", TODAY), expected);
  assert.deepStrictEqual(parseDate("8/24/26", TODAY), expected);
  assert.deepStrictEqual(parseDate("08.24.26", TODAY), expected);
  assert.deepStrictEqual(parseDate("8,24,26", TODAY), expected);
  assert.deepStrictEqual(parseDate("8;24;26", TODAY), expected);
});

test("digit syntax with 4-digit year", () => {
  assert.deepStrictEqual(parseDate("08-24-1926", TODAY), { year: 1926, month: 8, day: 24 });
});

test("digit syntax allows mixed separators", () => {
  assert.deepStrictEqual(parseDate("8_24+26", TODAY), { year: 2026, month: 8, day: 24 });
});

test("year omitted implies the current year", () => {
  assert.deepStrictEqual(parseDate("August 24", TODAY), { year: 2026, month: 8, day: 24 });
  assert.deepStrictEqual(parseDate("8-24", TODAY), { year: 2026, month: 8, day: 24 });
});

test("date omitted implies the first of the month", () => {
  assert.deepStrictEqual(parseDate("August", TODAY), { year: 2026, month: 8, day: 1 });
  assert.deepStrictEqual(parseDate("_August", TODAY), { year: 2026, month: 8, day: 1 });
  assert.deepStrictEqual(parseDate("_8", TODAY), { year: 2026, month: 8, day: 1 });
});

test("bare integers are day offsets, not dates, and throw", () => {
  assert.throws(() => parseDate("8", TODAY), DateCalError);
  assert.throws(() => parseDate("1", TODAY), DateCalError);
  assert.throws(() => parseDate("12", TODAY), DateCalError);
  assert.throws(() => parseDate("100", TODAY), DateCalError);
});

test("end specifier implies the last day of the month", () => {
  const endOfAugust = { year: 2026, month: 8, day: 31 };
  assert.deepStrictEqual(parseDate("Auguste", TODAY), endOfAugust);
  assert.deepStrictEqual(parseDate("August e", TODAY), endOfAugust);
  assert.deepStrictEqual(parseDate("August:e", TODAY), endOfAugust);
  assert.deepStrictEqual(parseDate("August_", TODAY), endOfAugust);
  assert.deepStrictEqual(parseDate("8_", TODAY), endOfAugust);
});

test("end specifier respects 30-day months", () => {
  assert.deepStrictEqual(parseDate("September e", TODAY), { year: 2026, month: 9, day: 30 });
  assert.deepStrictEqual(parseDate("4_", TODAY), { year: 2026, month: 4, day: 30 });
  assert.deepStrictEqual(parseDate("June e", TODAY), { year: 2026, month: 6, day: 30 });
  assert.deepStrictEqual(parseDate("11_", TODAY), { year: 2026, month: 11, day: 30 });
});

test("end specifier respects February and leap years", () => {
  assert.deepStrictEqual(parseDate("2_", { year: 2024, month: 1, day: 1 }), { year: 2024, month: 2, day: 29 });
  assert.deepStrictEqual(parseDate("2_", TODAY), { year: 2026, month: 2, day: 28 });
  assert.deepStrictEqual(parseDate("Februarye", { year: 2000, month: 1, day: 1 }), { year: 2000, month: 2, day: 29 });
});

test("sigil months resolve to the first or last day", () => {
  assert.deepStrictEqual(parseDate("_2", TODAY), { year: 2026, month: 2, day: 1 });
  assert.deepStrictEqual(parseDate("_December", TODAY), { year: 2026, month: 12, day: 1 });
  assert.deepStrictEqual(parseDate("December_", TODAY), { year: 2026, month: 12, day: 31 });
  assert.deepStrictEqual(parseDate("_Aug", TODAY), { year: 2026, month: 8, day: 1 });
});

test("a sigil is only valid on a token with no other separator", () => {
  assert.throws(() => parseDate("_8_24_26", TODAY), DateCalError);
  assert.throws(() => parseDate("8_24_26_", TODAY), DateCalError);
  assert.throws(() => parseDate("_8-24", TODAY), DateCalError);
  assert.throws(() => parseDate("_8_", TODAY), DateCalError);
  assert.throws(() => parseDate("_", TODAY), DateCalError);
  assert.throws(() => parseDate("_13", TODAY), DateCalError);
  assert.throws(() => parseDate("_notamonth", TODAY), DateCalError);
});

test("underscore stays a valid interior separator", () => {
  assert.deepStrictEqual(parseDate("8_24_26", TODAY), { year: 2026, month: 8, day: 24 });
  assert.deepStrictEqual(parseDate("8_24", TODAY), { year: 2026, month: 8, day: 24 });
});

test("digit end-of-month forms are removed and throw", () => {
  assert.throws(() => parseDate("8:e", TODAY), DateCalError);
  assert.throws(() => parseDate("8-e", TODAY), DateCalError);
  assert.throws(() => parseDate("8.24.e", TODAY), DateCalError);
});

test("trailing separators on digit dates throw", () => {
  assert.throws(() => parseDate("8-", TODAY), DateCalError);
  assert.throws(() => parseDate("8-24-26-", TODAY), DateCalError);
});

test("June parses as the month, not Jun plus end specifier", () => {
  assert.deepStrictEqual(parseDate("June", TODAY), { year: 2026, month: 6, day: 1 });
  assert.deepStrictEqual(parseDate("Junee", TODAY), { year: 2026, month: 6, day: 30 });
});

test("sloppy order with ordinal date and trailing month", () => {
  assert.deepStrictEqual(parseDate("20th 26 August", TODAY), { year: 2026, month: 8, day: 20 });
  assert.deepStrictEqual(parseDate("3rd 26 august", TODAY), { year: 2026, month: 8, day: 3 });
});

test("sloppy order with 4-digit year", () => {
  assert.deepStrictEqual(parseDate("August 2025 20", TODAY), { year: 2025, month: 8, day: 20 });
  assert.deepStrictEqual(parseDate("2026 August 20", TODAY), { year: 2026, month: 8, day: 20 });
});

test("invalid month number throws", () => {
  assert.throws(() => parseDate("13-1", TODAY), DateCalError);
  assert.throws(() => parseDate("0-24-26", TODAY), DateCalError);
});

test("day outside the month length throws", () => {
  assert.throws(() => parseDate("February 30 2026", TODAY), DateCalError);
  assert.throws(() => parseDate("2-29-2026", TODAY), DateCalError);
  assert.throws(() => parseDate("9-31-26", TODAY), DateCalError);
});

test("February 29 parses on a leap year", () => {
  assert.deepStrictEqual(parseDate("2-29-2024", TODAY), { year: 2024, month: 2, day: 29 });
});

test("illegal separators throw", () => {
  assert.throws(() => parseDate("8*24*26", TODAY), DateCalError);
  assert.throws(() => parseDate("8|24|26", TODAY), DateCalError);
});

test("unresolvable extra numbers throw", () => {
  assert.throws(() => parseDate("20 26 30 August", TODAY), DateCalError);
});

test("unparseable text throws", () => {
  assert.throws(() => parseDate("notamonth", TODAY), DateCalError);
});

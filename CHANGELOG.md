# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-15

### Breaking

- A bare integer on the CLI is **always** a day offset from today again, as in
  1.x: `datecal 8` prints the date 8 days away. The 2.0.0 reading of a single
  number 1-12 as a month is removed.
- A bare integer string is no longer a date anywhere: `parseDate("8")` and
  `dateCal("8")` now throw a `DateCalError` instead of resolving to August 1.
  Months written as digits require an explicit sigil (`_8`, `8_`).
- The digit end-of-month form `8:e` (and `8-e`, etc.) is removed and throws a
  `DateCalError`. The word forms (`Auguste`, `August e`) are unchanged.
- A digit date may not begin or end with a separator: `_8_24_26` and
  `8_24_26_` now throw a `DateCalError` (the CLI reports it cleanly and exits
  1). `_` remains a valid interior separator, so `8_24_26` parses unchanged.

### Migrations

- `datecal 8` meaning August: use `datecal _8` (August 1) or `datecal 8_` (August 31).
- `8:e`: use `8_`, `Auguste`, or `August e`.
- `parseDate("8")` / `dateCal("8")`: use `_8`, or pass a number for a day offset.
- Day offsets need no change: `datecal 100` and `dateCal(100)` behave as in 1.x.

### Added

- Month sigils: `_8` / `_August` resolve to the first day of the month and
  `8_` / `August_` to the last day, leap-aware for February (`2_`).
- `--` end-of-options marker in the CLI, so `datecal -- -8` also reaches the
  date logic.
- Single-unit duration output: `-d`/`--days`, `-m`/`--months`, and
  `-y`/`--years` CLI flags, and a matching `unit` option on `dateCal`. Days
  are always whole; months and years use a two-decimal, calendar-aware
  fraction below a whole unit (7 days into February is `0.25 months`; a
  quarter of a year is `0.25 years`). A unit flag takes precedence over
  `--verbose`, the last unit flag wins, and like `--verbose` the flags are
  ignored when the output is a date.

### Changed

- The bare-integer day-offset calculation is delegated to the
  [daycal](https://www.npmjs.com/package/daycal) package (dependency
  `daycal: ^1.1.0`), the canonical home of that calculation, for both the CLI
  and the programmatic `dateCal(days: number)` call. The output format is
  byte-identical. When the `today` option overrides the reference date, the
  date is computed locally, because daycal has no reference-date override and
  silently ignoring `today` would be unacceptable.

## [2.0.0] - 2026-08-14

### Added

- Duration calculation between two dates (`datecal 8-24-26 11-22-26` returns `2 months 29 days`)
- Duration calculation between a single date and today
- Stringed date syntax: full month names, abbreviations ending with a period,
  ordinal dates (e.g. `20th`), 2- or 4-digit years, and flexible part order
- Digit date syntax with punctuation separators (`, . ; : ' - _ @ # \ / +`)
- End-of-month specifier `e` (`Auguste`, `August e`, `8:e`) resolving to the
  last day of the month, aware of 30-day months and leap-year February
- Defaults for omitted parts: current year when the year is omitted, first of
  the month when the date is omitted
- Date-plus-days mode (`datecal 8-24-26 90` returns `November, 22 2026`)
- `--verbose` / `-v` flag to always print years, months, and days
- `--version` / `-V` flag
- Programmatic API: `parseDate`, `diffDates`, `addDays`, `formatDate`,
  `formatDuration`, `daysInMonth`, `isLeapYear`, `DateCalError`, and new
  `dateCal` overloads with `verbose` and `today` options
- Unit, integration, and regression test suites (`npm test`)
- `files` field in `package.json` for a lean npm package

### Changed

- **BREAKING**: A single CLI number from 1 to 12 is now read as a month
  (`datecal 8` prints the duration until August 1) instead of a day offset.
  Numbers outside 1-12 keep the day-offset behavior, and the programmatic
  `dateCal(days: number)` call is unchanged.
- CLI error messages now describe the invalid date part instead of only
  reporting a non-numeric argument

## [1.0.0] - 2026-08-14

### Added

- `dateCal(days)` function — returns a formatted date string relative to today
- CLI entry point (`datecal <days>`) for adding or subtracting days from today
- `--help` / `-h` flag support in the CLI
- Input validation with a descriptive error message for non-numeric arguments
- TypeScript source with generated type declarations (`dist/index.d.ts`)

[3.0.0]: https://github.com/jhauga/dateCal/releases/tag/v3.0.0
[2.0.0]: https://github.com/jhauga/dateCal/releases/tag/v2.0.0
[1.0.0]: https://github.com/jhauga/dateCal/releases/tag/v1.0.0

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/jhauga/dateCal/releases/tag/v1.0.0

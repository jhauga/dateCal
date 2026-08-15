# ![dateCal](https://raw.githubusercontent.com/jhauga/dateCal/refs/heads/main/logo.png)

A command-line date calculator. Get the duration between two dates, the duration
between a date and today, or the date a number of days away.

## Installation

```bash
npm install datecal
```

For global CLI access:

```bash
npm install -g datecal
```

## CLI Usage

```bash
datecal <date> [date | days]
datecal <days>
```

| Arguments | Result |
| --- | --- |
| Two dates | Duration between the dates (e.g. `2 months 29 days`) |
| One date | Duration between the date and today |
| One date and a number | The date that many days after (or before, if negative) the date |
| One number | The date that many days from today (`datecal 8`, `datecal -8`) |

A bare number is **always** a day offset from today, exactly as in 1.x. To
name a month by its number, use the `_` sigil: `_8` is August 1 and `8_` is
August 31.

### Date Formats

Dates can be written in a stringed syntax or a digit syntax:

| Format | Example | Notes |
| --- | --- | --- |
| Month name, date, year | `"August 24 2026"` | Quotes required only when passing two dates |
| Abbreviated month | `Aug. 24 26` | Abbreviation ends with a period; year can be 2 or 4 digits |
| Digits with separators | `8-24-26`, `8/24/2026`, `08.24.26` | Order is month, date, year; any of `, . ; : ' - _ @ # \ / +` separate |
| Ordinal dates | `"20th 26 August"` | Ordinals and 4-digit years let parts appear in any order |
| Month only | `August`, `_August`, `_8` | Implies the 1st of the month; digit months require the leading `_` sigil |
| Month with end specifier | `8_`, `August_`, `Auguste`, `August e` | Implies the last day of the month (30/31, and 28 or 29 for February on leap years) |

Omitted years imply the current year. Two-digit years resolve to the 2000s.

**The sigil rule is strict**: a leading or trailing `_` is a month sigil
*only* when the token contains no other separator character. `_` remains a
valid interior separator, so `8_24_26` parses as a full date, while
`_8_24_26` and `8_24_26_` are errors. The digit end-of-month form `8:e` was
removed; use `8_` or the word forms instead.

### Examples

```bash
# Today is August 14, 2026

datecal "August 24 2026" "November 22 2026"
# 2 months 29 days

datecal 8-24-26 11-22-26
# 2 months 29 days

datecal -d 8-24-26 11-22-26
# 90 days

datecal -m 8-24-26 11-22-26
# 2.94 months

datecal -y 8-24-26 11-22-26
# 0.25 years

datecal 08-24-1926 11-22-26
# 100 years 2 months 29 days

datecal -y 08-24-1926 11-22-26
# 100.25 years

datecal August 24 2026
# 10 days

datecal 8
# August, 22 2026     (8 days from today)

datecal -8
# August, 06 2026     (8 days before today)

datecal _8
# 13 days             (duration until August 1)

datecal 8_
# 17 days             (duration until August 31)

datecal Auguste
# 17 days

datecal 8-24-26 90
# November, 22 2026

datecal 100
# November, 22 2026
```

### Options

| Option | Description |
| --- | --- |
| `-v, --verbose` | Always print years, months, and days (e.g. `0 years 2 months 29 days`) |
| `-d, --days` | Print durations in whole days (e.g. `90 days`) |
| `-m, --months` | Print durations in months; under a whole month a two-decimal value is used (e.g. `0.25 months`) |
| `-y, --years` | Print durations in years; under a whole year a two-decimal value is used (e.g. `100.25 years`) |
| `-V, --version` | Print the version number |
| `-h, --help` | Show usage help |
| `--` | Treat every following argument as a date or number |

Like `--verbose`, the unit flags only shape duration output and are ignored
when the result is a date. A unit flag takes precedence over `--verbose`, and
when several unit flags are given the last one wins. Fractions are
calendar-aware: the leftover days are measured against the actual month or
year they fall in, so 7 days is `0.25 months` in a 28-day February but
`0.24 months` in a leap one. Days never need fractions, because dates differ
by whole days.

## Programmatic Usage

```typescript
import { dateCal } from "datecal";

dateCal("8-24-26", "11-22-26");   // "2 months 29 days"
dateCal("August 24 2026");        // duration from today, e.g. "10 days"
dateCal("8-24-26", 90);           // "November, 22 2026"
dateCal(10);                      // the date 10 days from today
dateCal("8-24-26", "11-22-26", { unit: "months" });  // "2.94 months"
```

### API

#### `dateCal(input, [second], [options])`

The main entry point. Behavior depends on the arguments:

| Call | Returns |
| --- | --- |
| `dateCal(days: number)` | Date `days` from today, formatted `"Month, DD YYYY"` |
| `dateCal(date: string)` | Duration between the date and today |
| `dateCal(from: string, to: string)` | Duration between the two dates |
| `dateCal(from: string, days: number)` | Date `days` after `from`, formatted `"Month, DD YYYY"` |

The `dateCal(days: number)` calculation is delegated to the
[daycal](https://www.npmjs.com/package/daycal) package, the canonical home of
the day-offset calculation. When the `today` option is passed, the date is
computed locally instead, because daycal takes no reference-date override --
the option is honored either way.

Note that a bare integer *string* (`dateCal("8")`) is not a date and throws:
pass day offsets as numbers, and name months with the `_8` / `8_` sigils.

**Options** (last argument):

| Option | Type | Description |
| --- | --- | --- |
| `verbose` | `boolean` | Always include years, months, and days in duration output |
| `today` | `Date \| CalendarDate` | Reference date used as "today" (defaults to the system date) |
| `unit` | `"days" \| "months" \| "years"` | Report durations in a single unit; months and years use a two-decimal fraction below a whole unit. Takes precedence over `verbose` |

**Throws:** `DateCalError` when a date expression cannot be parsed or is invalid
(unknown month, day outside the month's length, illegal separator, or an
ambiguous date).

#### Helper Exports

| Export | Signature | Description |
| --- | --- | --- |
| `parseDate` | `(expression: string, today?) => CalendarDate` | Parse a date expression into `{ year, month, day }` |
| `diffDates` | `(a, b) => Duration` | Calendar duration between two dates as `{ years, months, days }` |
| `addDays` | `(date: CalendarDate, days: number) => CalendarDate` | Add or subtract whole days |
| `formatDate` | `(date) => string` | Format as `"Month, DD YYYY"` |
| `formatDuration` | `(duration, verbose?) => string` | Format a duration, dropping leading zero groups unless verbose |
| `daysInMonth` | `(month, year) => number` | Days in a month, leap-year aware |
| `isLeapYear` | `(year) => boolean` | Leap year check |

```typescript
import { parseDate, diffDates, formatDuration } from "datecal";

const from = parseDate("August 24 2026");
const to = parseDate("November 22 2026");
formatDuration(diffDates(from, to)); // "2 months 29 days"
```

## Output Format

Durations drop leading zero groups by default:

```text
10 days
2 months 29 days
100 years 2 months 29 days
```

With `--verbose` (or `verbose: true`), all three groups always print. With a
unit flag (or the `unit` option), the duration prints in that single unit,
using a two-decimal fraction for months and years below a whole unit
(`0.25 years`). Dates are returned in the `Month, DD YYYY` format
(e.g. `November, 22 2026`).

## Upgrading from 2.x

The 1.x behavior for bare numbers is **restored**: every bare integer is a day
offset from today again, so `datecal 8` prints the date 8 days away. The 2.0.0
reading of a single number 1-12 as a month is gone.

To name a month by number, use an explicit sigil: `_8` for August 1 and `8_`
for August 31 (leap-aware for February). The sigils also work on names
(`_August`, `August_`). A leading or trailing `_` is a sigil only on a token
with no other separator, so `8_24_26` still parses as a full date while
`_8_24_26` and `8_24_26_` are errors.

The digit end-of-month form `8:e` is removed; use `8_` or the word forms
(`Auguste`, `August e`), which are unchanged.

## Build and Test

```bash
npm run build            # compile TypeScript to dist/
npm test                 # build and run all test suites
npm run test:unit        # unit tests only
npm run test:integration # CLI integration tests only
npm run test:regression  # 1.x behavior regression tests only
```

## License

MIT

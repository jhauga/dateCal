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
| One number outside 1-12 | The date that many days from today |

### Date Formats

Dates can be written in a stringed syntax or a digit syntax:

| Format | Example | Notes |
| --- | --- | --- |
| Month name, date, year | `"August 24 2026"` | Quotes required only when passing two dates |
| Abbreviated month | `Aug. 24 26` | Abbreviation ends with a period; year can be 2 or 4 digits |
| Digits with separators | `8-24-26`, `8/24/2026`, `08.24.26` | Order is month, date, year; any of `, . ; : ' - _ @ # \ / +` separate |
| Ordinal dates | `"20th 26 August"` | Ordinals and 4-digit years let parts appear in any order |
| Month only | `August`, `8` | Implies the 1st of the month |
| Month with end specifier | `Auguste`, `August e`, `8:e` | Implies the last day of the month (30/31, and 28 or 29 for February on leap years) |

Omitted years imply the current year. Two-digit years resolve to the 2000s.

### Examples

```bash
# Today is August 14, 2026

datecal "August 24 2026" "November 22 2026"
# 2 months 29 days

datecal 8-24-26 11-22-26
# 2 months 29 days

datecal 08-24-1926 11-22-26
# 100 years 2 months 29 days

datecal August 24 2026
# 10 days

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
| `-V, --version` | Print the version number |
| `-h, --help` | Show usage help |

## Programmatic Usage

```typescript
import { dateCal } from "datecal";

dateCal("8-24-26", "11-22-26");   // "2 months 29 days"
dateCal("August 24 2026");        // duration from today, e.g. "10 days"
dateCal("8-24-26", 90);           // "November, 22 2026"
dateCal(10);                      // the date 10 days from today
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

**Options** (last argument):

| Option | Type | Description |
| --- | --- | --- |
| `verbose` | `boolean` | Always include years, months, and days in duration output |
| `today` | `Date \| CalendarDate` | Reference date used as "today" (defaults to the system date) |

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

With `--verbose` (or `verbose: true`), all three groups always print. Dates are
returned in the `Month, DD YYYY` format (e.g. `November, 22 2026`).

## Upgrading from 1.x

The CLI meaning of a single number from 1 to 12 changed: `datecal 8` now reads
as the month of August and prints the duration until August 1, instead of the
date 8 days from today. Numbers outside 1-12 keep the 1.x day-offset behavior.
The programmatic `dateCal(days: number)` call is unchanged.

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

#!/usr/bin/env node

import { DateCalError, DurationUnit, dateCal, isMonthExpression } from "./index";

const VERSION = "3.0.0";
const INTEGER = /^-?\d+$/;
const FLAGS = new Set(["--help", "-h", "--version", "-V", "--verbose", "-v"]);
const UNIT_FLAGS = new Map<string, DurationUnit>([
  ["-d", "days"],
  ["--days", "days"],
  ["-m", "months"],
  ["--months", "months"],
  ["-y", "years"],
  ["--years", "years"],
]);

function printHelp(): void {
  console.log("Usage: datecal <date> [date | days]");
  console.log("       datecal <days>");
  console.log("");
  console.log("Calculate the duration between two dates, the duration between a date");
  console.log("and today, or the date a number of days away.");
  console.log("");
  console.log("A bare number is always a day offset from today; months need a _ sigil.");
  console.log("");
  console.log("Date formats:");
  console.log('  "August 24 2026"   Month name, date, year (quotes needed with two dates)');
  console.log("  Aug. 24 26         Abbreviated month (ends with .), 2- or 4-digit year");
  console.log("  8-24-26            Digits separated by punctuation (- / . , ; : etc.)");
  console.log("  August 24          Year omitted implies the current year");
  console.log("  August, _August    Date omitted implies the 1st of the month");
  console.log("  _8                 Leading _ sigil: the 1st of month 8 (August 1)");
  console.log("  8_, August_        Trailing _ sigil: the last day of the month");
  console.log("  Auguste, August e  End specifier e implies the last day of the month");
  console.log("");
  console.log("Options:");
  console.log("  -v, --verbose      Always print years, months, and days");
  console.log("  -d, --days         Print durations in whole days");
  console.log("  -m, --months       Print durations in months (decimal under a whole month)");
  console.log("  -y, --years        Print durations in years (decimal under a whole year)");
  console.log("  -V, --version      Print the version number");
  console.log("  -h, --help         Show this help");
  console.log("  --                 Treat every following argument as a date or number");
  console.log("");
  console.log("Examples:");
  console.log('  datecal "August 24 2026" "November 22 2026"   # 2 months 29 days');
  console.log("  datecal 8-24-26 11-22-26                      # 2 months 29 days");
  console.log("  datecal -m 8-24-26 11-22-26                   # 2.94 months");
  console.log("  datecal -y 8-24-26 11-22-26                   # 0.25 years");
  console.log("  datecal August 24 2026                        # days until that date");
  console.log("  datecal _8                                    # days until August 1");
  console.log("  datecal 8_                                    # days until the end of August");
  console.log("  datecal 8-24-26 100                           # the date 100 days later");
  console.log("  datecal 100                                   # the date 100 days from today");
  console.log("  datecal -8                                    # the date 8 days ago");
}

const args = process.argv.slice(2);
let verbose = false;
let unit: DurationUnit | undefined;
let endOfOptions = false;
const positionals: string[] = [];

for (const arg of args) {
  if (endOfOptions) {
    positionals.push(arg);
  } else if (arg === "--") {
    endOfOptions = true;
  } else if (FLAGS.has(arg)) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--version" || arg === "-V") {
      console.log(VERSION);
      process.exit(0);
    }
    verbose = true;
  } else if (UNIT_FLAGS.has(arg)) {
    // Like --verbose, unit flags only shape duration output; when several
    // are given the last one wins.
    unit = UNIT_FLAGS.get(arg);
  } else if (arg === "-e") {
    // End-of-month specifier written flag-style, e.g. "datecal August -e".
    positionals.push("e");
  } else {
    positionals.push(arg);
  }
}

if (positionals.length === 0) {
  printHelp();
  process.exit(0);
}

try {
  let output: string;

  if (positionals.length === 1) {
    const only = positionals[0];
    if (INTEGER.test(only)) {
      // Every bare integer, positive or negative, is a day offset from
      // today. Months need the _8 / 8_ sigil forms.
      output = dateCal(parseInt(only, 10));
    } else {
      output = dateCal(only, { verbose, unit });
    }
  } else if (positionals.length === 2 && INTEGER.test(positionals[1])) {
    const [first, second] = positionals;
    const n = parseInt(second, 10);
    const isNamedMonth = isMonthExpression(first) && !INTEGER.test(first);
    if (isNamedMonth && n >= 1 && n <= 31) {
      // "datecal August 24" is one date, not August 1st plus 24 days.
      output = dateCal(`${first} ${second}`, { verbose, unit });
    } else {
      output = dateCal(first, n, { verbose, unit });
    }
  } else if (positionals.length === 2 && !isMonthExpression(positionals[0])) {
    output = dateCal(positionals[0], positionals[1], { verbose, unit });
  } else {
    output = dateCal(positionals.join(" "), { verbose, unit });
  }

  console.log(output);
} catch (error) {
  const message = error instanceof DateCalError ? error.message : `${error}`;
  console.error(`Error: ${message}`);
  process.exit(1);
}

#!/usr/bin/env node

import { DateCalError, dateCal, isMonthExpression } from "./index";

const VERSION = "2.0.0";
const INTEGER = /^-?\d+$/;
const FLAGS = new Set(["--help", "-h", "--version", "-V", "--verbose", "-v"]);

function printHelp(): void {
  console.log("Usage: datecal <date> [date | days]");
  console.log("       datecal <days>");
  console.log("");
  console.log("Calculate the duration between two dates, the duration between a date");
  console.log("and today, or the date a number of days away.");
  console.log("");
  console.log("Date formats:");
  console.log('  "August 24 2026"   Month name, date, year (quotes needed with two dates)');
  console.log("  Aug. 24 26         Abbreviated month (ends with .), 2- or 4-digit year");
  console.log("  8-24-26            Digits separated by punctuation (- / . , ; : etc.)");
  console.log("  August 24          Year omitted implies the current year");
  console.log("  August, 8          Date omitted implies the 1st of the month");
  console.log("  Auguste, 8:e       End specifier e implies the last day of the month");
  console.log("");
  console.log("Options:");
  console.log("  -v, --verbose      Always print years, months, and days");
  console.log("  -V, --version      Print the version number");
  console.log("  -h, --help         Show this help");
  console.log("");
  console.log("Examples:");
  console.log('  datecal "August 24 2026" "November 22 2026"   # 2 months 29 days');
  console.log("  datecal 8-24-26 11-22-26                      # 2 months 29 days");
  console.log("  datecal August 24 2026                        # days until that date");
  console.log("  datecal 8:e                                   # days until the end of August");
  console.log("  datecal 8-24-26 100                           # the date 100 days later");
  console.log("  datecal 100                                   # the date 100 days from today");
}

const args = process.argv.slice(2);
let verbose = false;
const positionals: string[] = [];

for (const arg of args) {
  if (FLAGS.has(arg)) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--version" || arg === "-V") {
      console.log(VERSION);
      process.exit(0);
    }
    verbose = true;
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
      const n = parseInt(only, 10);
      // A bare 1-12 reads as a month; anything else keeps the v1 behavior
      // of a day offset from today.
      output = n >= 1 && n <= 12 ? dateCal(only, { verbose }) : dateCal(n);
    } else {
      output = dateCal(only, { verbose });
    }
  } else if (positionals.length === 2 && INTEGER.test(positionals[1])) {
    const [first, second] = positionals;
    const n = parseInt(second, 10);
    const isNamedMonth = isMonthExpression(first) && !INTEGER.test(first);
    if (isNamedMonth && n >= 1 && n <= 31) {
      // "datecal August 24" is one date, not August 1st plus 24 days.
      output = dateCal(`${first} ${second}`, { verbose });
    } else {
      output = dateCal(first, n, { verbose });
    }
  } else if (positionals.length === 2 && !isMonthExpression(positionals[0])) {
    output = dateCal(positionals[0], positionals[1], { verbose });
  } else {
    output = dateCal(positionals.join(" "), { verbose });
  }

  console.log(output);
} catch (error) {
  const message = error instanceof DateCalError ? error.message : `${error}`;
  console.error(`Error: ${message}`);
  process.exit(1);
}

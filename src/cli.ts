#!/usr/bin/env node

import { dateCal } from "./index";

const arg = process.argv[2];

if (arg === undefined || arg === "--help" || arg === "-h") {
  console.log("Usage: datecal <days>");
  console.log("  Calculate a date relative to today.");
  console.log("  <days>  Number of days to add (positive) or subtract (negative).");
  console.log("");
  console.log("Examples:");
  console.log("  datecal 10    # 10 days from today");
  console.log("  datecal -10   # 10 days ago");
  process.exit(0);
}

const days = Number(arg);

if (isNaN(days)) {
  console.error(`Error: "${arg}" is not a valid number.`);
  process.exit(1);
}

console.log(dateCal(days));

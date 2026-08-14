/**
 * dateCal - calculate durations between calendar dates and dates relative to today.
 *
 * Supports two input syntaxes:
 * - Stringed syntax: month name or abbreviation with optional date and year,
 *   e.g. "August 24 2026", "Aug. 24 26", "20th 26 August".
 * - Digit syntax: month, date, and year digits joined by punctuation,
 *   e.g. "8-24-26", "8/24/2026", "08.24.26".
 */

const MS_PER_DAY = 86_400_000;

/** A plain calendar date. Month is 1-12. */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

/** A calendar duration broken down into years, months, and days. */
export interface Duration {
  years: number;
  months: number;
  days: number;
}

/** Options accepted by {@link dateCal}. */
export interface DateCalOptions {
  /** Always output the full "N years N months N days" form. */
  verbose?: boolean;
  /** Reference date used as "today". Defaults to the current system date. */
  today?: Date | CalendarDate;
}

/** Error thrown for unparseable or invalid date input. */
export class DateCalError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DateCalError";
    this.code = code;
  }
}

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const MONTH_ABBREVIATIONS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const DISPLAY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Allowed digit-syntax separators: , . ; : ' - _ @ # \ / +
const DIGIT_SEPARATOR = /[,.;:'\-_@#\\/+]/;
const DIGIT_TOKEN = /^[0-9]([0-9,.;:'\-_@#\\/+]|[eE])*$/;
const INTEGER = /^\d+$/;
const ORDINAL = /^(\d{1,2})(st|nd|rd|th)$/i;
const END_TOKENS = new Set(["e", "-e", ":e"]);

/** Returns true when the given year is a leap year. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Returns the number of days in the given month (1-12) of the given year. */
export function daysInMonth(month: number, year: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

function toCalendarDate(value: Date | CalendarDate): CalendarDate {
  if (value instanceof Date) {
    return { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
  }
  return { year: value.year, month: value.month, day: value.day };
}

function toUtcMs(date: CalendarDate): number {
  // Date.UTC maps years 0-99 to 1900-1999; all parsed years are normalized
  // to four digits first, so pass components straight through.
  const ms = new Date(0);
  ms.setUTCFullYear(date.year, date.month - 1, date.day);
  return ms.getTime();
}

function fromUtcMs(ms: number): CalendarDate {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** Adds (or subtracts, when negative) whole days to a calendar date. */
export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

function addMonths(date: CalendarDate, months: number): CalendarDate {
  const monthIndex = date.month - 1 + months;
  const year = date.year + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  const day = Math.min(date.day, daysInMonth(month, year));
  return { year, month, day };
}

/**
 * Calculates the calendar duration between two dates. Argument order does not
 * matter; the result is always non-negative. Months are counted the way a
 * calendar reads: the month component advances each time the starting
 * day-of-month is reached (clamped for short months), and the leftover days
 * are counted from there.
 */
export function diffDates(a: CalendarDate | Date, b: CalendarDate | Date): Duration {
  let from = toCalendarDate(a);
  let to = toCalendarDate(b);
  if (toUtcMs(from) > toUtcMs(to)) {
    [from, to] = [to, from];
  }

  let months = (to.year - from.year) * 12 + (to.month - from.month);
  while (months > 0 && toUtcMs(addMonths(from, months)) > toUtcMs(to)) {
    months--;
  }
  const anchor = addMonths(from, months);
  const days = Math.round((toUtcMs(to) - toUtcMs(anchor)) / MS_PER_DAY);

  return { years: Math.floor(months / 12), months: months % 12, days };
}

/** Formats a calendar date as "Month, DD YYYY" (e.g. "March, 31 2026"). */
export function formatDate(date: CalendarDate | Date): string {
  const d = toCalendarDate(date);
  return `${DISPLAY_MONTHS[d.month - 1]}, ${String(d.day).padStart(2, "0")} ${d.year}`;
}

/**
 * Formats a duration. By default the leading zero groups are dropped:
 * "13 days", "2 months 29 days", "100 years 2 months 29 days".
 * With verbose set, all three groups are always shown.
 */
export function formatDuration(duration: Duration, verbose = false): string {
  const group = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  const years = group(duration.years, "year");
  const months = group(duration.months, "month");
  const days = group(duration.days, "day");

  if (verbose || duration.years > 0) {
    return `${years} ${months} ${days}`;
  }
  if (duration.months > 0) {
    return `${months} ${days}`;
  }
  return days;
}

interface MonthMatch {
  month: number;
  endOfMonth: boolean;
}

function matchMonthName(raw: string): number | null {
  const stripped = raw.endsWith(".") ? raw.slice(0, -1) : raw;
  if (stripped.length < 3) {
    return null;
  }
  const fullIndex = MONTH_NAMES.indexOf(stripped);
  if (fullIndex !== -1) {
    return fullIndex + 1;
  }
  return MONTH_ABBREVIATIONS[stripped] ?? null;
}

function matchMonthToken(token: string): MonthMatch | null {
  const lower = token.toLowerCase();

  for (const suffix of [":e", "-e"]) {
    if (lower.endsWith(suffix)) {
      const month = matchMonthName(lower.slice(0, -suffix.length));
      return month === null ? null : { month, endOfMonth: true };
    }
  }

  const direct = matchMonthName(lower);
  if (direct !== null) {
    return { month: direct, endOfMonth: false };
  }

  // "Auguste" style: a full or abbreviated month name with "e" appended.
  // Checked after direct matching so "June" resolves to June, not "Jun" + e.
  if (lower.endsWith("e")) {
    const month = matchMonthName(lower.slice(0, -1));
    if (month !== null) {
      return { month, endOfMonth: true };
    }
  }

  return null;
}

/**
 * Returns true when the token is a bare month on its own: a month name or
 * abbreviation ("August", "Aug."), or a month number 1-12 with no separators.
 */
export function isMonthExpression(token: string): boolean {
  if (INTEGER.test(token)) {
    const n = parseInt(token, 10);
    return n >= 1 && n <= 12;
  }
  return matchMonthToken(token) !== null;
}

function normalizeYear(raw: string): number {
  if (raw.length !== 2 && raw.length !== 4) {
    throw new DateCalError("INVALID_YEAR", `Invalid year "${raw}". Use 2 or 4 digits.`);
  }
  const value = parseInt(raw, 10);
  return raw.length === 2 ? 2000 + value : value;
}

function validateMonth(value: number, raw: string): number {
  if (value < 1 || value > 12) {
    throw new DateCalError("INVALID_MONTH", `Invalid month "${raw}". Expected 1-12 or a month name.`);
  }
  return value;
}

function resolveDay(
  day: number | undefined,
  month: number,
  year: number,
  endOfMonth: boolean
): number {
  const limit = daysInMonth(month, year);
  if (day === undefined) {
    return endOfMonth ? limit : 1;
  }
  if (day < 1 || day > limit) {
    throw new DateCalError(
      "INVALID_DAY",
      `Invalid date "${day}". ${DISPLAY_MONTHS[month - 1]} ${year} has ${limit} days.`
    );
  }
  return day;
}

function parseDigitExpression(token: string, today: CalendarDate): CalendarDate {
  if (!DIGIT_TOKEN.test(token)) {
    throw new DateCalError(
      "ILLEGAL_SEPARATOR",
      `Cannot parse "${token}". Digit dates use punctuation separators such as - / . , ; :`
    );
  }

  const parts = token.split(DIGIT_SEPARATOR).filter((part) => part !== "");
  let endOfMonth = false;
  if (parts.length > 0 && parts[parts.length - 1].toLowerCase() === "e") {
    endOfMonth = true;
    parts.pop();
  }

  if (parts.length < 1 || parts.length > 3 || !parts.every((part) => INTEGER.test(part))) {
    throw new DateCalError(
      "INVALID_DATE",
      `Cannot parse "${token}". Expected month, optional date, and optional year, e.g. 8-24-26.`
    );
  }

  const month = validateMonth(parseInt(parts[0], 10), parts[0]);
  const day = parts.length >= 2 ? parseInt(parts[1], 10) : undefined;
  const year = parts.length === 3 ? normalizeYear(parts[2]) : today.year;

  return { year, month, day: resolveDay(day, month, year, endOfMonth) };
}

function parseStringedExpression(tokens: string[], today: CalendarDate): CalendarDate {
  let month: number | undefined;
  let endOfMonth = false;
  let year: number | undefined;
  let day: number | undefined;
  const plain: string[] = [];

  for (const token of tokens) {
    if (END_TOKENS.has(token.toLowerCase())) {
      endOfMonth = true;
      continue;
    }

    const monthMatch = matchMonthToken(token);
    if (monthMatch !== null && month === undefined && !INTEGER.test(token)) {
      month = monthMatch.month;
      endOfMonth = endOfMonth || monthMatch.endOfMonth;
      continue;
    }

    const ordinal = ORDINAL.exec(token);
    if (ordinal !== null) {
      if (day !== undefined) {
        throw new DateCalError("INVALID_DATE", `Found more than one date in "${tokens.join(" ")}".`);
      }
      day = parseInt(ordinal[1], 10);
      continue;
    }

    if (INTEGER.test(token)) {
      if (token.length === 4) {
        if (year !== undefined) {
          throw new DateCalError("INVALID_DATE", `Found more than one year in "${tokens.join(" ")}".`);
        }
        year = normalizeYear(token);
      } else {
        plain.push(token);
      }
      continue;
    }

    throw new DateCalError("INVALID_DATE", `Cannot parse "${token}" in "${tokens.join(" ")}".`);
  }

  // Assign leftover plain numbers positionally: date first, then year.
  for (const token of plain) {
    if (month === undefined && day === undefined && year === undefined && isMonthExpression(token)) {
      month = parseInt(token, 10);
    } else if (day === undefined) {
      day = parseInt(token, 10);
    } else if (year === undefined) {
      year = normalizeYear(token);
    } else {
      throw new DateCalError(
        "AMBIGUOUS_DATE",
        `Ambiguous date "${tokens.join(" ")}". Use an ordinal date (e.g. 20th) or a 4-digit year.`
      );
    }
  }

  if (month === undefined) {
    throw new DateCalError("INVALID_MONTH", `No month found in "${tokens.join(" ")}".`);
  }
  if (year === undefined) {
    year = today.year;
  }

  return { year, month, day: resolveDay(day, month, year, endOfMonth) };
}

/**
 * Parses a date expression into a calendar date.
 *
 * Accepts stringed syntax ("August 24 2026", "Aug. 24", "Auguste", "August e",
 * "20th 26 August") and digit syntax ("8-24-26", "8/24/2026", "8:e"). Omitted
 * parts fall back to the reference date: a missing year implies the current
 * year, and a missing date implies the 1st of the month, or the last day of
 * the month when the "e" end-of-month specifier is used.
 *
 * @param expression - The date expression to parse.
 * @param today - Reference date for omitted parts. Defaults to the system date.
 * @returns The resolved calendar date.
 * @throws {DateCalError} When the expression cannot be parsed or is invalid.
 */
export function parseDate(expression: string, today: Date | CalendarDate = new Date()): CalendarDate {
  const reference = toCalendarDate(today);
  const tokens = expression.trim().split(/\s+/).filter((token) => token !== "");

  if (tokens.length === 0) {
    throw new DateCalError("EMPTY_INPUT", "No date provided.");
  }

  if (tokens.length === 1) {
    const token = tokens[0];
    if (INTEGER.test(token)) {
      const month = validateMonth(parseInt(token, 10), token);
      return { year: reference.year, month, day: 1 };
    }
    if (/^[0-9]/.test(token)) {
      return parseDigitExpression(token, reference);
    }
  }

  return parseStringedExpression(tokens, reference);
}

/**
 * Calculates a date relative to today by adding or subtracting days.
 * @param days - Number of days to add (positive) or subtract (negative) from today.
 * @returns Formatted date string as "Month, DD YYYY" (e.g., "March, 31 2026").
 */
export function dateCal(days: number, options?: DateCalOptions): string;
/**
 * Calculates the duration between a date expression and today.
 * @param date - A date expression, e.g. "August 24 2026", "8-24-26", or "Auguste".
 * @returns Duration string, e.g. "10 days" or "2 months 29 days".
 */
export function dateCal(date: string, options?: DateCalOptions): string;
/**
 * Calculates the duration between two date expressions.
 * @param from - The first date expression.
 * @param to - The second date expression.
 * @returns Duration string, e.g. "2 months 29 days".
 */
export function dateCal(from: string, to: string, options?: DateCalOptions): string;
/**
 * Adds days to a date expression and returns the resulting date.
 * @param from - The base date expression.
 * @param days - Number of days to add (positive) or subtract (negative).
 * @returns Formatted date string as "Month, DD YYYY".
 */
export function dateCal(from: string, days: number, options?: DateCalOptions): string;
export function dateCal(
  first: string | number,
  second?: string | number | DateCalOptions,
  third?: DateCalOptions
): string {
  let options: DateCalOptions = {};
  let target: string | number | undefined;

  if (typeof second === "object" && second !== null) {
    options = second;
  } else {
    target = second;
    options = third ?? {};
  }

  const today = toCalendarDate(options.today ?? new Date());

  if (typeof first === "number") {
    return formatDate(addDays(today, first));
  }

  const base = parseDate(first, today);

  if (typeof target === "number") {
    return formatDate(addDays(base, target));
  }
  if (typeof target === "string") {
    return formatDuration(diffDates(base, parseDate(target, today)), options.verbose);
  }
  return formatDuration(diffDates(base, today), options.verbose);
}

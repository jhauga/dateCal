# ![dateCal](https://raw.githubusercontent.com/jhauga/dateCal/refs/heads/main/logo.png)

A simple command-line tool. Calculate a date relative to today's date.

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
datecal <days>
```

| Argument | Description |
|----------|-------------|
| `days`   | Number of days to add (positive) or subtract (negative) from today |

### Examples

```bash
# Today is March 21, 2026

datecal 10
# March, 31 2026

datecal -10
# March, 11 2026

datecal 0
# March, 21 2026
```

## Programmatic Usage

```typescript
import { dateCal } from "datecal";

const result = dateCal(10);
console.log(result); // "March, 31 2026"
```

### API

#### `dateCal(days: number): string`

Returns a formatted date string relative to today.

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `days`    | `number` | Days to add (positive) or subtract (negative) from today |

**Returns:** `string` — formatted as `"Month, DD YYYY"` (e.g., `"March, 31 2026"`)

## Output Format

Dates are returned in the format:

```
Month, DD YYYY
```

- **Month** — Full month name (e.g., `March`)
- **DD** — Two-digit day, zero-padded (e.g., `01`, `15`, `31`)
- **YYYY** — Four-digit year

## Build

```bash
npm run build
```

## License

MIT

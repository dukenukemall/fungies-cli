import Table from 'cli-table3'
import chalk from 'chalk'

export type OutputFormat = 'table' | 'json' | 'csv'

export function renderTable(headers: string[], rows: unknown[][]): void {
  const table = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
  })
  for (const row of rows) {
    table.push(row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))))
  }
  console.log(table.toString())
}

export function renderJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2))
}

export function renderCsv(headers: string[], rows: unknown[][]): void {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  console.log(headers.map(escape).join(','))
  for (const row of rows) {
    console.log(row.map(escape).join(','))
  }
}

export function renderSuccess(msg: string): void {
  console.log(chalk.green('✓') + ' ' + msg)
}

export function renderError(msg: string): void {
  console.error(chalk.red('✗') + ' ' + msg)
}

export function renderWarning(msg: string): void {
  console.warn(chalk.yellow('⚠') + ' ' + msg)
}

export function renderOutput(
  format: OutputFormat,
  headers: string[],
  rows: unknown[][],
  rawData?: unknown,
): void {
  switch (format) {
    case 'json':
      renderJson(rawData ?? rows)
      break
    case 'csv':
      renderCsv(headers, rows)
      break
    default:
      renderTable(headers, rows)
  }
}

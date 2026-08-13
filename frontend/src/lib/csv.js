const FORMULA_PREFIX = /^[\t\r\n ]*[=+\-@]/;

export function neutralizeSpreadsheetFormula(value) {
  const text = String(value ?? '');
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

export function escapeCsvValue(value) {
  const safeValue = neutralizeSpreadsheetFormula(value).replace(/\r?\n/g, ' ');
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function createCsv(columns, rows) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(','),
  );
  return [header, ...body].join('\r\n');
}

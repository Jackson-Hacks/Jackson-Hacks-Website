// Count-aware pagination also works when an API caps pages below our requested
// size. A failed/incomplete page must never silently produce a partial export.
export async function readAllRows(makeQuery) {
  const rows = [];
  for (;;) {
    const { data, error, count } = await makeQuery().range(rows.length, rows.length + 499);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (count !== null && count !== undefined) {
      if (rows.length >= count) return rows;
      if (!page.length) throw new Error('Results were incomplete. Please refresh.');
    } else if (page.length < 500) return rows;
  }
}

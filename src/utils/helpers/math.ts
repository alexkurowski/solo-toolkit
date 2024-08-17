export const sum = (values: number[]): number =>
  values.reduce((sum, value) => sum + (value || 0), 0);

function cartesianProduct(...allEntries: number[][]): number[][] {
  return allEntries.reduce<number[][]>(
    (results, entries) =>
      results
        .map((result) => entries.map((entry) => result.concat([entry])))
        .reduce((subResults, result) => subResults.concat(result), []),
    [[]]
  );
}

export function curveValues(table: {
  values: string[];
  curve: number;
}): string[] {
  if (!table.curve || table.curve <= 1) return table.values;
  if (table.values.length <= 2) return table.values;

  const size = table.values.length;

  // XdY
  let x = Math.min(table.curve, 6); // Limit to 6d
  let y = Math.max(Math.ceil(size / x), 2);

  // Reduce curve to avoid memory issues
  while (x > 2 && y ** x > 100000) {
    x--;
    y = Math.max(Math.ceil(size / x), 2);
  }

  const dice: number[][] = [];
  for (let i = 0; i < x; i++) {
    dice[i] = [];
    for (let j = 0; j < y; j++) {
      dice[i][j] = j;
    }
  }
  const product = cartesianProduct(...dice);
  const sums = product.map(sum);

  const result: string[] = [];
  for (const index of sums) {
    if (index < size) {
      result.push(table.values[index]);
    }
  }

  return result;
}

// function curveStats(values: string[]) {
//   const stats: Record<string, number> = {};
//   for (const k of values) {
//     stats[k] = stats[k] || 0;
//     stats[k] += 1;
//   }
//   return stats;
// }

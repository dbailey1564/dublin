export type EvalResult = { total: number; usedMask: boolean[] };

function scoreSet(face: number, count: number): number {
  if (face === 1) {
    return count >= 1 ? 100 * Math.pow(2, count - 1) : 0;
  } else {
    if (count < 2) return 0;
    return (face * 20) * Math.pow(2, count - 2);
  }
}

export function evaluateSelection(values: number[]): EvalResult {
  if (values.length === 0) return { total: 0, usedMask: [] };
  const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0};
  values.forEach(v => counts[v]++);

  let total = 0;
  let valid = true;

  for (let face = 1; face <= 6; face++) {
    const c = counts[face];
    if (c === 0) continue;
    if (face === 1) {
      total += scoreSet(1, c);
    } else {
      if (c < 2) { valid = false; break; }
      total += scoreSet(face, c);
    }
  }
  const usedMask = values.map(_ => valid);
  return { total: valid ? total : 0, usedMask };
}

export function isLargeStraight5(dice5: number[]): boolean {
  if (dice5.length !== 5) return false;
  const set = Array.from(new Set(dice5)).sort((a,b)=>a-b).join(',');
  return set === '1,2,3,4,5' || set === '2,3,4,5,6';
}

// Find best valid subset of free dice; returns indices into full dice array and score.
export function bestSetIndices(dice: number[], held: boolean[]): { indices: number[]; score: number } {
  const freeIndices = dice.map((_,i)=>i).filter(i => !held[i]);
  let bestScore = 0;
  let best: number[] = [];
  const n = freeIndices.length;
  for (let mask = 1; mask < (1<<n); mask++) {
    const idxs: number[] = [];
    const vals: number[] = [];
    for (let k = 0; k < n; k++) {
      if (mask & (1<<k)) {
        const idx = freeIndices[k];
        idxs.push(idx);
        vals.push(dice[idx]);
      }
    }
    const { total, usedMask } = evaluateSelection(vals);
    if (total > bestScore && usedMask.every(Boolean)) {
      bestScore = total;
      best = idxs;
    }
  }
  return { indices: best, score: bestScore };
}

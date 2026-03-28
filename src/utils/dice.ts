export const rollIntervals = [30, 60, 60, 90, 90, 120, 160];

export const random = (min: number, max: number, not = NaN): number => {
  let result = not;
  while (result === not || Number.isNaN(result)) {
    result = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return result;
};

export const roll = (max: number, not = -1): number => random(1, max, not);

export const nrandom = (
  quantity: number,
  min: number,
  max: number,
  not = NaN
): number => {
  let result = not;
  while (result === not || Number.isNaN(result)) {
    result = 0;
    for (let i = 0; i < quantity; i++) {
      result += Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  return result;
};

export const nroll = (quantity: number, max: number, not = -1): number => 
  nrandom(quantity, 1, max, not);

export const nrollDetails = (quantity: number, min: number, max: number, not = NaN): { sum: number; rolls: number[] } => {
  let sum = not;
  let rolls: number[] = [];

  while (sum === not || Number.isNaN(sum)) {
    sum = 0;
    rolls = [];
    for (let i = 0; i < quantity; i++) {
      const val = nrandom(1, min, max, not);
      rolls.push(val);
      sum += val;
    }
  }
  return { sum, rolls };
};

export const randomFrom = <T>(values: T[], not: T | null = null): T => {
  if (!values?.length) {
    return values[0];
  } else if (values.length <= 1) {
    return values[0];
  } else if (not === null) {
    return values[random(0, values.length - 1)];
  } else {
    let result: T = not;
    while (result === not) {
      result = values[random(0, values.length - 1)];
    }
    return result;
  }
};

export const rollIntervals = [30, 60, 60, 90, 90, 120, 160];

export const random = (min: number, max: number, not = -1): number => {
  let result = not;
  while (result === not) {
    result = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return result;
};

export const roll = (max: number, not = -1): number => random(1, max, not);

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

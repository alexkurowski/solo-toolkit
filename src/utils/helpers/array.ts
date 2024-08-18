export const identity = (value: string): string => value;

export const shuffle = <T>(arr: T[]) => {
  let index = arr.length;
  let random = 0;

  while (index != 0) {
    random = Math.floor(Math.random() * index);
    index--;
    [arr[index], arr[random]] = [arr[random], arr[index]];
  }
};

export function first<T>(arr: T[]): T {
  return arr[0];
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function isEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  if (!a.length || !b.length) return true;
  for (const i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function isHead<T>(a: T[], b: T[]): boolean {
  if (!a.length || !b.length) return true;
  const arr = a.length > b.length ? a : b;
  for (const i in arr) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

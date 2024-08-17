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

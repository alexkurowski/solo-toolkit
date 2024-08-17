import { Notice } from "obsidian";
import { vowels } from "./word";

export const compareWords = (
  valueA: string | undefined,
  valueB: string | undefined
): boolean => {
  if (valueA === undefined || valueB === undefined) return false;
  if (!valueA && !valueB) return true;
  if (!valueA || !valueB) return false;
  valueA = valueA.toLowerCase().trim();
  valueB = valueB.toLowerCase().trim();

  return (
    valueA === valueB ||
    valueA === valueB + "s" ||
    valueA === valueB.replace(/y$/, "ies")
  );
};

export const findWordKey = (
  values: Record<string, string[]>,
  key: string
): string | undefined =>
  Object.keys(values).find((valueKey) => compareWords(valueKey, key));

export const normalizeTemplateValue = (str: string): string => {
  if (str.length > 1) {
    if (str[0] === str[str.length - 1]) {
      if (str[0] === "'" || str[0] === '"') {
        str = str.replace(/^['"]|['"]$/g, "");
      }
    }
  }
  return str.trim();
};

export const capitalize = (value: string): string => {
  if (value) {
    return value[0].toUpperCase() + value.substring(1);
  } else {
    return "";
  }
};

export const an = (nextWord: string): "a" | "an" => {
  if (vowels.includes((nextWord[0] || "").toLowerCase())) {
    return "an";
  } else {
    return "a";
  }
};

export const trim = (value: string): string => value.trim();

export const identity = (value: string): string => value;

export const sum = (values: number[]): number =>
  values.reduce((sum, value) => sum + (value || 0), 0);

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

export const clickToCopy = (value: string) => (event?: MouseEvent) => {
  event?.preventDefault();
  navigator.clipboard.writeText(value);
  new Notice("Copied to clipboard");
};

export const clickToCopyImage =
  (value: string, flip: number) => (event: MouseEvent) => {
    event.preventDefault();

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = function (event) {
      const target = event.target as HTMLImageElement;
      if (flip === 1 || flip === 3) {
        canvas.width = target.naturalHeight;
        canvas.height = target.naturalWidth;
      } else {
        canvas.width = target.naturalWidth;
        canvas.height = target.naturalHeight;
      }

      // Make image not larger that 300px to save on space
      let scale = 1;
      const maxSize = 300;
      if (canvas.width > maxSize || canvas.height > maxSize) {
        scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
        canvas.width = Math.floor(canvas.width * scale);
        canvas.height = Math.floor(canvas.height * scale);
      }

      if (ctx) {
        if (flip) {
          switch (flip) {
            case 1:
              ctx.translate(canvas.width, 0);
              break;
            case 2:
              ctx.translate(canvas.width, canvas.height);
              break;
            case 3:
              ctx.translate(0, canvas.height);
              break;
          }
          ctx.rotate((flip * 90 * Math.PI) / 180);
        }
        ctx.scale(scale, scale);
        ctx.drawImage(target, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(() => {
                new Notice("Copied to clipboard");
              })
              .catch((error) => {
                new Notice(`Failed to copy: ${error}`);
              });
          }
        }, "image/png");
      }
    };

    img.src = value;
  };

export function bounce(timeout: number, once = false) {
  let lastTime = 0;
  return {
    set: () => {
      lastTime = Date.now();
    },
    check: () => {
      const result = lastTime + timeout > Date.now();
      if (once) lastTime = 0;
      return result;
    },
  };
}

export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  function debounced(...args: Parameters<T>) {
    const later = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  return debounced as T;
}

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

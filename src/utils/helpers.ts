import { Notice } from "obsidian";

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

export const capitalize = (value: string): string => {
  if (value) {
    return value[0].toUpperCase() + value.substring(1);
  } else {
    return "";
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

export const clickToCopy = (value: string) => (event: MouseEvent) => {
  event.preventDefault();
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

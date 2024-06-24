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

export const shuffle = <T>(arr: T[]) => {
  let index = arr.length;
  let random = 0;

  while (index != 0) {
    random = Math.floor(Math.random() * index);
    index--;
    [arr[index], arr[random]] = [arr[random], arr[index]];
  }
};

export const clickToCopy = (value: string) => (event: MouseEvent) => {
  event.preventDefault();
  navigator.clipboard.writeText(value);
  new Notice("Copied to clipboard");
};

export const clickToCopyImage = (value: string) => (event: MouseEvent) => {
  event.preventDefault();

  try {
    const contentType = value.substring(
      value.indexOf(":") + 1,
      value.indexOf(";")
    );
    const chars = atob(value.replace(`data:${contentType};base64,`, ""));
    const bytes = [];
    for (let i = 0; i < chars.length; i++) {
      bytes.push(chars.charCodeAt(i));
    }

    const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });
    navigator.clipboard
      .write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      .then(() => {
        new Notice("Copied to clipboard");
      })
      .catch((error) => {
        new Notice(`Failed to copy: ${error}`);
      });
  } catch (error) {
    new Notice(`Failed to copy: ${error}`);
  }
};

export function first<T>(arr: T[]): T {
  return arr[0];
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

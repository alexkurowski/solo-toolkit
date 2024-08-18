import { vowels } from "../word";

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
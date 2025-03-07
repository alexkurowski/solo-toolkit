import { TFile } from "obsidian";
import {
  randomFrom,
  an,
  capitalize,
  random,
  compareWords,
  findWordKey,
  trim,
  sum,
  getDefaultDictionary,
  curveValues,
} from "../../utils";
import { DEFAULT } from "./constants";
import { parseFileContent, parseKeyWithCurve } from "./parser";
import {
  CustomTableMode,
  CustomTableTemplate,
  CustomTable,
  CustomTableCurves,
} from "./types";
import { WordView } from "./view";

export class CustomDict {
  private mode: CustomTableMode = "default";
  private templates: CustomTableTemplate[] = [];
  private values: CustomTable = { [DEFAULT]: [] };
  private curves: CustomTableCurves = { [DEFAULT]: 1 };

  constructor(private view: WordView, private tabName: string) {}

  parseFile(
    file: TFile,
    customTableData: {
      path: string[];
      tabName: string;
      fileName: string;
    }
  ) {
    const [_, defaultCurve] = parseKeyWithCurve(file.basename);
    this.view.view.app.vault.cachedRead(file).then((content: string) => {
      const parsed = parseFileContent(content);
      this.mode = parsed.mode;
      this.templates = parsed.templates;
      this.values = parsed.values;
      this.curves = {
        ...parsed.curves,
        [DEFAULT]: defaultCurve,
      };

      if (this.mode === "default") {
        this.view.customTables.push({
          ...customTableData,
          templates: this.templates,
          values: this.values,
          curves: this.curves,
        });
      }
    });
  }

  generateWord(): string[] {
    if (this.mode === "default") {
      if (this.templates.length) {
        const template = randomFrom(this.templates);
        const repeat = template.repeat || 1;
        const previousSubs: Record<string, string> = {};

        const results: string[] = [];
        for (let _ = 0; _ < repeat; _++) {
          let result = template.value;
          // Import keys from other folders
          for (let i = 0; i < 5; i++) {
            const newResult = result.replace(/{+ ?[^}]+ ?}+/g, (v) =>
              this.replaceKeyWithTemplate(v)
            );
            if (newResult === result) break;
            result = newResult;
          }
          // Replace all keys with actual words
          for (let i = 0; i < 5; i++) {
            const newResult = result.replace(
              /{+ ?<? ?[^}]+ ?}+/g,
              this.replaceKeyWithWord(previousSubs)
            );
            if (newResult === result) break;
            result = newResult;
          }
          // Write a/an based on the next word
          result = result.replace(
            /{+ ?a ?}+/g,
            (key: string, index: number, original: string) => {
              const match = original.substring(index + key.length).match(/\w/);
              if (match) {
                return an(match[0]);
              } else {
                return key;
              }
            }
          );
          result = result.trim();

          // Apply template's casing rules
          if (template.capitalize) {
            result = capitalize(result);
          }
          if (template.upcase) {
            result = result.toUpperCase();
          }

          results.push(result);
        }
        return results;
      } else {
        return [randomFrom(this.getValuesForKeys(DEFAULT))];
      }
    } else if (this.mode === "cutup") {
      const words = this.values[DEFAULT];
      const length = random(2, 6) + random(2, 6);
      const startFrom = random(0, words.length - length - 1);
      return [words.slice(startFrom, startFrom + length).join(" ")];
    } else if (this.mode === "markov") {
      const words = this.values[DEFAULT];
      const length = random(4, 8) + random(4, 8);
      const result: string[] = [randomFrom(words)];
      let nextWords: string[] = [];
      for (let i = 0; i < length; i++) {
        nextWords = words.filter((_word, index, arr) =>
          compareWords(arr[index - 1], result[i])
        );
        if (nextWords.length) {
          result.push(randomFrom(nextWords));
        } else {
          result.push(randomFrom(words));
        }
      }
      return [result.filter((word) => !!word).join(" ")];
    } else {
      return [randomFrom(this.values[DEFAULT])];
    }
  }

  //

  private getValuesForKey(key: string): { values: string[]; curve: number } {
    let result: string[] | undefined;
    let curve: number = 1;

    // Sections in this file
    const sectionKey = findWordKey(this.values, key);
    if (sectionKey) {
      result = this.values[sectionKey];
      if (result?.length) {
        curve = this.curves[sectionKey] || 1;
        return { values: result, curve };
      }
    }

    // Sections in other custom files
    const keyParts = key.split("/").map(trim);
    const otherCustomTable =
      this.view.customTables.find(
        // category/filename
        (customTable) =>
          compareWords(customTable.tabName, keyParts[0]) &&
          compareWords(customTable.fileName, keyParts[1])
      ) ||
      this.view.customTables.find(
        // [same-category]/filename
        (customTable) =>
          compareWords(customTable.tabName, this.tabName) &&
          compareWords(customTable.fileName, keyParts[0])
      ) ||
      this.view.customTables.find(
        // [any-category]/filename
        (customTable) => compareWords(customTable.fileName, keyParts[0])
      );
    if (otherCustomTable) {
      // Return all values if there are no sections present or specified
      if (
        keyParts.length === 1 ||
        Object.keys(otherCustomTable.values).length === 1
      ) {
        result = otherCustomTable.values[DEFAULT];
        if (result?.length) {
          curve = otherCustomTable.curves[DEFAULT] || 1;
          return { values: result, curve };
        }
      }

      // Lookup section for format category/filename/section
      for (let i = 0; i < keyParts.length; i++) {
        // Search by parts in case section also has '/' in it
        // 'section', then 'filename/section', and so on
        const otherTableKey = keyParts.slice(keyParts.length - i - 1).join("/");

        const otherTableMatchedSectionKey = findWordKey(
          otherCustomTable.values,
          otherTableKey
        );

        if (otherTableMatchedSectionKey) {
          result = otherCustomTable.values[otherTableMatchedSectionKey];
          if (result?.length) {
            curve = otherCustomTable.curves[otherTableMatchedSectionKey] || 1;
            return { values: result, curve };
          }
        }
      }
    }

    // Files in other custom subfolder
    const otherCustomTables = this.view.customTables.filter(
      // category/[any-filename]
      (customTable) => compareWords(customTable.tabName, key)
    );
    if (otherCustomTables?.length) {
      result = otherCustomTables.map((table) => table.values[DEFAULT]).flat();
      if (result?.length) {
        const curveSum = sum(
          otherCustomTables.map((table) => table.curves[DEFAULT])
        );
        curve = Math.round(curveSum / otherCustomTables.length) || 1;
        return {
          values: result,
          curve,
        };
      }
    }

    // Filenames or file contents in other custom subfolder
    if (keyParts.length === 2 && (keyParts[1] === "*" || keyParts[1] === "!")) {
      const otherCustomTables = this.view.customTables.filter(
        // category/[any-filename]
        (customTable) => compareWords(customTable.tabName, keyParts[0])
      );
      if (otherCustomTables?.length) {
        if (keyParts[1] === "*") {
          result = otherCustomTables.map((table) => table.fileName);
        } else if (keyParts[1] === "!") {
          result = otherCustomTables.map((table) =>
            table.values[DEFAULT].join("\n")
          );
        }
        if (result?.length) {
          curve = 1;
          return {
            values: result,
            curve,
          };
        }
      }
    }

    // Default generic
    result = getDefaultDictionary(key);
    if (result?.length) return { values: result, curve: 1 };

    return { values: [], curve: 1 };
  }

  private getValuesForKeys(key: string): string[] {
    const keys = key.split("|").map(trim);
    const result = keys
      .map((key) => this.getValuesForKey(key))
      .map(curveValues)
      .flat();
    if (result?.length) {
      return result;
    } else {
      return [`{${key}}`];
    }
  }

  private replaceKeyWithWord(lastSubs: Record<string, string>) {
    return (wrapperKey: string): string => {
      let key = wrapperKey.replace(/{|}/g, "").trim().toLowerCase();
      if (!key) return "";
      if (key.startsWith("<")) {
        key = key.replace("<", "").trim();
        if (lastSubs[key]) {
          return lastSubs[key];
        }
      }
      return (lastSubs[key] = randomFrom(
        this.getValuesForKeys(key),
        lastSubs[key] || null
      ));
    };
  }

  private replaceKeyWithTemplate(wrapperKey: string): string {
    const key = wrapperKey.replace(/{|}/g, "").trim().toLowerCase();
    if (!key) return "";
    // Find files from another custom folder
    const tables = this.view.customTables.filter(
      // category/[any-filename]
      (customTable) => compareWords(customTable.tabName, key)
    );
    if (tables.length) {
      // Take random file from folder
      const table = randomFrom(tables);
      if (table.templates?.length) {
        // Take random foreign template
        let template = randomFrom(table.templates).value;
        // Provide folder and file context for each foreign subkey
        template = template.replace(
          /{+ ?[^}]+ ?}+/g,
          (wrappedSubKey: string) => {
            let subKey = wrappedSubKey.replace(/{|}/g, "").trim().toLowerCase();
            if (subKey.includes("|")) {
              // Apply pipe and leave only a single key
              subKey = randomFrom(subKey.split("|")).trim();
            }
            if (subKey.includes("/")) {
              // Key already has some kind of context
              return `{${subKey}}`;
            }

            // Check if key is a section in that table
            if (findWordKey(table.values, subKey)) {
              // Specify full folder/file/section path to that table
              return `{${table.tabName}/${table.fileName}/${subKey}}`;
            } else {
              // Key is not a section in that table
              return `{${subKey}}`;
            }
          }
        );
        if (template) {
          return template;
        }
      } else if (table) {
        return `{${table.tabName}/${table.fileName}}`;
      }
    }
    return `{${key}}`;
  }
}

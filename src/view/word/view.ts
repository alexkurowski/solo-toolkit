import {
  TFile,
  TFolder,
  ButtonComponent,
  ExtraButtonComponent,
  TextAreaComponent,
  debounce,
} from "obsidian";
import { SoloToolkitView as View } from "../index";
import {
  generateWord,
  random,
  randomFrom,
  clickToCopy,
  getDefaultDictionary,
  capitalize,
  compareWords,
  trim,
  curveValues,
  an,
  sum,
  findWordKey,
} from "../../utils";
import { TabSelect } from "../shared/tabselect";
import {
  wordLabels,
  wordTooltips,
  DEFAULT,
  MAX_REMEMBER_SIZE,
} from "./constants";
import {
  CustomTableCategory,
  CustomTableMode,
  CustomTableTemplate,
  CustomTable,
  CustomTableCurves,
} from "./types";
import { parseFileContent, parseKeyWithCurve } from "./parser";

export class WordView {
  view: View;
  customTables: CustomTableCategory[];
  words: [string, string][];

  tab: string;
  tabSelect: TabSelect;
  tabContainerEl: HTMLElement;
  tabContentEls: Record<string, HTMLElement>;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.words = [];
  }

  create() {
    // Create layout
    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("word-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    this.tabContainerEl = this.view.tabViewEl.createDiv(
      "word-buttons-container"
    );
    this.tabContentEls = {};

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("word-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    // Populate layout
    if (!this.view.settings.disableDefaultWords) {
      this.createWordBtn("Prompts", "promptSubject");
      this.createWordBtn("Prompts", "promptAction");
      this.createWordBtn("Prompts", "promptGoal");
      this.createWordBtn("Characters", "npcName");
      this.createWordBtn("Characters", "npcAspects");
      this.createWordBtn("Characters", "npcSkills");
      this.createWordBtn("Characters", "npcJob");
      this.createWordBtn("Locations", "locName");
      this.createWordBtn("Locations", "locDescription");
      this.createWordBtn("Locations", "locBuilding");
      this.createWordBtn("Locations", "locWilderness");
    }

    this.customTables = [];

    if (this.view.settings.customTableRoot) {
      const folder = this.view.app.vault.getFolderByPath(
        this.view.settings.customTableRoot
      );
      if (folder) {
        this.createCustomWordBtns(folder);
      }
    }

    this.createQuickWordBtn("Quick table...");

    const tabElsCount = Object.keys(this.tabContentEls).length;
    const availableTabs = Object.keys(this.tabContentEls);
    const defaultTab = availableTabs.includes(this.view.settings.wordTab)
      ? this.view.settings.wordTab
      : availableTabs[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    if (tabElsCount === 0) {
      this.tabContentEls["blank"] = this.tabContainerEl.createDiv(
        "word-buttons shown blank"
      );
      this.tabContentEls["blank"].createDiv().setText(`No random tables found`);
      this.tabContentEls["blank"]
        .createDiv()
        .setText(
          `(enable default random tables or add your own in '${this.view.settings.customTableRoot}' folder)`
        );
      this.tabSelect.hide();
    }

    this.repopulateResults();
  }

  reset() {
    this.words = [];
    this.resultsEl.empty();
  }

  setTab(newTab: string) {
    this.tab = newTab;
    this.view.setSettings({ wordTab: newTab });
    for (const tabName in this.tabContentEls) {
      if (tabName === newTab) {
        this.tabContentEls[tabName].show();
      } else {
        this.tabContentEls[tabName].hide();
      }
    }
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["word-result"];
    if (immediate) elClass.push("nofade");
    const el = this.resultsEl.createEl("a", { cls: elClass.join(" ") });

    el.onclick = (event) => {
      switch (this.view.settings.wordClipboardMode) {
        case "plain":
          return clickToCopy(value)(event);
        case "code":
          return clickToCopy(`\`${value}\``)(event);
      }
    };

    const typeEl = el.createSpan("word-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("word-result-value");

    const lines = value.split("\n");
    for (const line of lines) {
      const lineEl = valueEl.createDiv();
      lineEl.setText(line);
    }
  }

  createWordBtn(tabName: string, type: string) {
    if (!this.tabContentEls[tabName]) {
      this.tabContentEls[tabName] =
        this.tabContainerEl.createDiv("word-buttons");
      this.tabSelect.addOption(tabName, tabName);
    }

    const label = wordLabels[type] || capitalize(type);
    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(label)
      .setTooltip(`Generate ${wordTooltips[type] || type.toLowerCase()}`)
      .onClick(() => {
        const value = generateWord(type);
        this.words.push([label, value]);
        this.addResult(label, value);
      });
  }

  createCustomWordBtns(folder: TFolder, path: string[] = []) {
    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (child.extension === "md") {
          this.createCustomWordBtn(folder, child, path);
        }
      }
      if (child instanceof TFolder) {
        this.createCustomWordBtns(child, [...path, child.name]);
      }
    }
  }

  createCustomWordBtn(folder: TFolder, file: TFile, path: string[]) {
    const [defaultKey, defaultCurve] = parseKeyWithCurve(file.basename);
    const tabName = folder.name.replace(/\.$/, "");
    const type = defaultKey;

    let mode: CustomTableMode = "default";
    const templates: CustomTableTemplate[] = [];
    const values: CustomTable = { [DEFAULT]: [] };
    const curves: CustomTableCurves = { [DEFAULT]: defaultCurve };

    this.view.app.vault.read(file).then((content: string) => {
      mode = parseFileContent({
        content,
        templates,
        values,
        curves,
      });

      if (mode === "default") {
        this.customTables.push({
          path,
          tabName,
          fileName: type,
          templates,
          values,
          curves,
        });
      }
    });

    if (
      folder.name.endsWith(".") ||
      path.some((folderName) => folderName.endsWith("."))
    )
      return;

    const getValuesForKey = (
      key: string
    ): { values: string[]; curve: number } => {
      let result: string[] | undefined;
      let curve: number = 1;

      // Sections in this file
      const sectionKey = findWordKey(values, key);
      if (sectionKey) {
        result = values[sectionKey];
        if (result?.length) {
          curve = curves[sectionKey] || 1;
          return { values: result, curve };
        }
      }

      // Sections in other custom files
      const keyParts = key.split("/").map(trim);
      const otherCustomTable =
        this.customTables.find(
          // category/filename
          (customTable) =>
            compareWords(customTable.tabName, keyParts[0]) &&
            compareWords(customTable.fileName, keyParts[1])
        ) ||
        this.customTables.find(
          // [same-category]/filename
          (customTable) =>
            compareWords(customTable.tabName, tabName) &&
            compareWords(customTable.fileName, keyParts[0])
        ) ||
        this.customTables.find(
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
          const otherTableKey = keyParts
            .slice(keyParts.length - i - 1)
            .join("/");

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
      const otherCustomTables = this.customTables.filter(
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
      if (
        keyParts.length === 2 &&
        (keyParts[1] === "*" || keyParts[1] === "!")
      ) {
        const otherCustomTables = this.customTables.filter(
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
    };

    const getValuesForKeys = (key: string): string[] => {
      const keys = key.split("|").map(trim);
      const result = keys.map(getValuesForKey).map(curveValues).flat();
      if (result?.length) {
        return result;
      } else {
        return [`{${key}}`];
      }
    };

    const replaceKeyWithWord =
      (lastSubs: Record<string, string>) =>
      (wrapperKey: string): string => {
        const key = wrapperKey.replace(/{|}/g, "").trim().toLowerCase();
        if (!key) return "";
        return (lastSubs[key] = randomFrom(
          getValuesForKeys(key),
          lastSubs[key] || null
        ));
      };

    const replaceKeyWithTemplate = (wrapperKey: string): string => {
      const key = wrapperKey.replace(/{|}/g, "").trim().toLowerCase();
      if (!key) return "";
      // Find files from another custom folder
      const tables = this.customTables.filter(
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
              let subKey = wrappedSubKey
                .replace(/{|}/g, "")
                .trim()
                .toLowerCase();
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
    };

    const generateCustomWord = (): string[] => {
      if (mode === "default") {
        if (templates.length) {
          const template = randomFrom(templates);
          const repeat = template.repeat || 1;
          const previousSubs: Record<string, string> = {};

          const results: string[] = [];
          for (let _ = 0; _ < repeat; _++) {
            let result = template.value;
            // Import keys from other folders
            for (let i = 0; i < 5; i++) {
              const newResult = result.replace(
                /{+ ?[^}]+ ?}+/g,
                replaceKeyWithTemplate
              );
              if (newResult === result) break;
              result = newResult;
            }
            // Replace all keys with actual words
            for (let i = 0; i < 5; i++) {
              const newResult = result.replace(
                /{+ ?[^}]+ ?}+/g,
                replaceKeyWithWord(previousSubs)
              );
              if (newResult === result) break;
              result = newResult;
            }
            // Write a/an based on the next word
            result = result.replace(
              /{+ ?a ?}+/g,
              (key: string, index: number, original: string) => {
                const match = original
                  .substring(index + key.length)
                  .match(/\w/);
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
          return [randomFrom(getValuesForKeys(DEFAULT))];
        }
      } else if (mode === "cutup") {
        const words = values[DEFAULT];
        const length = random(2, 6) + random(2, 6);
        const startFrom = random(0, words.length - length - 1);
        return [words.slice(startFrom, startFrom + length).join(" ")];
      } else if (mode === "markov") {
        const words = values[DEFAULT];
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
        return [randomFrom(values[DEFAULT])];
      }
    };

    if (!this.tabContentEls[tabName]) {
      this.tabContentEls[tabName] =
        this.tabContainerEl.createDiv("word-buttons");
      this.tabSelect.addOption(tabName, tabName);
    }

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        const values = generateCustomWord();
        if (values.every((value) => !value)) return;
        for (let value of values) {
          value = value.split(/< ?br ?\/? ?>|\\n/).join("\n");
          this.words.push([type, value]);
          this.addResult(type, value);
        }
      });
  }

  createQuickWordBtn(tabName: string) {
    if (!this.tabContentEls[tabName]) {
      this.tabContentEls[tabName] = this.tabContainerEl.createDiv("word-quick");
      this.tabSelect.addOption(tabName, tabName);
    }

    const input = new TextAreaComponent(this.tabContentEls[tabName]);
    const initialInputValue = this.view.settings.wordQuickValue ?? "";
    const initialInputHeight = this.view.settings.wordQuickHeight ?? 100;
    input.setValue(initialInputValue);
    input.inputEl.style.height = `${initialInputHeight}px`;
    input.onChange(
      debounce((newValue: string) => {
        this.view.setSettings({ wordQuickValue: newValue });
      }, 1000)
    );
    new ResizeObserver(() => {
      this.view.setSettings({ wordQuickHeight: input.inputEl.offsetHeight });
    }).observe(input.inputEl);

    const buttonsContainerEl =
      this.tabContentEls[tabName].createDiv("word-quick-buttons");

    new ButtonComponent(buttonsContainerEl)
      .setButtonText("Reset")
      .setTooltip("Reset values")
      .onClick(() => {
        input.setValue("");
        this.view.setSettings({ wordQuickValue: "" });
      });

    new ButtonComponent(buttonsContainerEl)
      .setButtonText("Roll")
      .setTooltip(`Generate a random word`)
      .onClick(() => {
        const values = input.getValue().split("\n").map(trim);
        const value = randomFrom(values);
        if (value) {
          this.words.push(["Quick", value]);
          this.addResult("Quick", value);
        }
      });

    new ExtraButtonComponent(buttonsContainerEl)
      .setIcon(`copy`)
      .setTooltip(`Copy to clipboard`)
      .onClick(() => {
        clickToCopy(input.getValue())();
        input.setValue("");
        this.view.setSettings({ wordQuickValue: "" });
      })
      .extraSettingsEl.addClass("word-quick-ctc");
  }

  repopulateResults() {
    while (this.words.length > MAX_REMEMBER_SIZE) {
      this.words.shift();
    }

    for (const word of this.words) {
      const [type, value] = word;
      this.addResult(type, value, true);
    }
  }
}

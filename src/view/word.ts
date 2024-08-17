import {
  TFile,
  TFolder,
  ButtonComponent,
  ExtraButtonComponent,
  TextAreaComponent,
  debounce,
} from "obsidian";
import { SoloToolkitView as View } from "./index";
import {
  generateWord,
  random,
  randomFrom,
  clickToCopy,
  getDefaultDictionary,
  capitalize,
  compareWords,
  trim,
  identity,
  curveValues,
  an,
  sum,
  findWordKey,
  normalizeTemplateValue,
} from "../utils";
import { TabSelect } from "./shared/tabselect";

interface CustomTable {
  [section: string]: string[];
}
interface CustomTableCurves {
  [section: string]: number;
}
type CustomTableMode = "default" | "cutup" | "notes";
interface CustomTableCategory {
  tabName: string;
  fileName: string;
  templates: string[];
  values: CustomTable;
  curves: CustomTableCurves;
}

const MAX_REMEMBER_SIZE = 100;
const DEFAULT = "DEFAULT";

const wordLabels: { [word: string]: string } = {
  promptSubject: "Subject",
  promptAction: "Action",
  promptGoal: "Goal",

  npcName: "Name",
  npcAspects: "Aspects",
  npcSkills: "Skills",
  npcJob: "Occupation",

  locName: "Name",
  locDescription: "Description",
  locBuilding: "Town",
  locWilderness: "Wilderness",
};
const wordTooltips: { [word: string]: string } = {
  promptSubject: "a subject",
  promptAction: "an action",

  npcName: "a name",
  npcAspects: "character aspects",
  npcSkills: "character skills",
  npcJob: "an occupation",

  locName: "a town name",
  locDescription: "generic description",
  locBuilding: "town encounter",
  locWilderness: "wilderness encounter",
};

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
    valueEl.setText(value);
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

  createCustomWordBtns(folder: TFolder) {
    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (child.extension === "md") {
          this.createCustomWordBtn(folder.name, child);
        }
      }
      if (child instanceof TFolder) {
        this.createCustomWordBtns(child);
      }
    }
  }

  createCustomWordBtn(tabName: string, file: TFile) {
    const [defaultKey, defaultCurve] = this.parseKeyWithCurve(file.basename);
    const type = defaultKey;
    let mode: CustomTableMode = "default";

    const templates: string[] = [];
    const values: CustomTable = { [DEFAULT]: [] };
    const curves: CustomTableCurves = { [DEFAULT]: defaultCurve };

    this.view.app.vault.read(file).then((content: string) => {
      if (!content) return;

      const lines = content.split("\n").map(trim).filter(identity);

      let currentKey = "";
      let readingProperties = false;

      for (let i = 0; i < lines.length; i++) {
        const line: string = lines[i];

        // Switch properties parsing mode
        if (i == 0 && line === "---") {
          readingProperties = true;
          continue;
        } else if (readingProperties && line === "---") {
          readingProperties = false;
          continue;
        }

        // New template
        if (readingProperties) {
          const templateKey = line.substring(0, line.indexOf(":"));

          let templateValue = line.substring(line.indexOf(":") + 1).trim();
          // Multiline value
          if (templateValue === "|-") {
            i++;
            const newTemplateValue: string[] = [];
            while (!lines[i].includes(":") && lines[i] !== "---") {
              let newLine = lines[i].trim();
              newLine = normalizeTemplateValue(newLine);
              if (newLine) {
                newTemplateValue.push(newLine);
              }
              i++;
            }
            templateValue = newTemplateValue.join("<br/>");
            i--;
          }
          // Remove wrapping quotation marks
          templateValue = normalizeTemplateValue(templateValue);

          const newTemplate = templateValue
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");
          // Ignore blank templates
          if (!newTemplate) continue;

          if (
            templateKey.toLowerCase().trim() === "mode" &&
            newTemplate.toLowerCase().trim() === "cutup"
          ) {
            mode = "cutup";
          } else if (
            templateKey.toLowerCase().trim() === "mode" &&
            (newTemplate.toLowerCase().trim() === "note" ||
              newTemplate.toLowerCase().trim() === "notes")
          ) {
            mode = "notes";
          } else if (
            templateKey.length > 1 &&
            templateKey === templateKey.toUpperCase()
          ) {
            templates.push("upcase!" + newTemplate.toLowerCase());
          } else if (
            templateKey.length > 1 &&
            templateKey === capitalize(templateKey)
          ) {
            templates.push("capitalize!" + newTemplate.toLowerCase());
          } else {
            templates.push(newTemplate);
          }
          continue;
        }

        // Treat headers as template keys
        if (line.startsWith("#")) {
          const [key, curve] = this.parseKeyWithCurve(
            line.replace(/#/g, "").trim().toLowerCase()
          );

          currentKey = key;
          values[currentKey] = [];
          curves[currentKey] = curve;
          continue;
        }

        if (mode === "default") {
          values[DEFAULT].push(line);
          if (currentKey) values[currentKey].push(line);
        } else if (mode === "cutup") {
          values[DEFAULT].push(...line.split(/ +/));
        }
      }

      if (mode === "default") {
        this.customTables.push({
          tabName,
          fileName: type,
          templates,
          values,
          curves,
        });
      }
    });

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

      // Files in other custom folder
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
          let template = randomFrom(table.templates);
          // Cleanup foreign template
          template = template.replace(/^(capitalize!|upcase!)/, "").trim();
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

    const generateCustomWord = (): string => {
      if (mode === "default") {
        if (templates.length) {
          const template = randomFrom(templates);
          const previousSubs: Record<string, string> = {};

          let result = template;
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
              const match = original.substring(index + key.length).match(/\w/);
              if (match) {
                return an(match[0]);
              } else {
                return key;
              }
            }
          );
          result = result.trim();

          // Apply template's casing rules and return
          if (template.startsWith("capitalize!")) {
            return capitalize(result.replace("capitalize!", ""));
          } else if (template.startsWith("upcase!")) {
            return result.replace("upcase!", "").toUpperCase();
          } else {
            return result;
          }
        } else {
          return randomFrom(getValuesForKeys(DEFAULT));
        }
      } else if (mode === "cutup") {
        const words = values[DEFAULT];
        const length = random(2, 6) + random(2, 6);
        const startFrom = random(0, words.length - length - 1);
        return words.slice(startFrom, startFrom + length).join(" ");
      } else if (mode === "notes") {
        return "WIP";
      } else {
        return randomFrom(values[DEFAULT]);
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
        const value = generateCustomWord();
        if (!value) return;
        value
          .split(/< ?br ?\/? ?>|\\n/)
          .reverse()
          .forEach((line) => {
            if (line) {
              this.words.push([type, line]);
              this.addResult(type, line);
            }
          });
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

  private parseKeyWithCurve(value: string): [string, number] {
    const match = value.match(/ \d+d$/i);
    if (match) {
      return [
        value.replace(match[0], "").trim(),
        parseInt(match[0].replace(/\D/g, "")),
      ];
    } else {
      return [value, 1];
    }
  }
}

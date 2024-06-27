import { TFile, TFolder, ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import {
  generateWord,
  randomFrom,
  clickToCopy,
  getDefaultDictionary,
  capitalize,
  compareWords,
  trim,
  identity,
} from "../utils";
import { TabSelect } from "./shared/tabselect";

interface CustomTable {
  [section: string]: string[];
}
interface CustomTableCategory {
  tabName: string;
  fileName: string;
  values: CustomTable;
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
    el.onclick = clickToCopy(value);

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
    const type = file.basename;
    const templates: string[] = [];
    const values: CustomTable = { [DEFAULT]: [] };

    this.view.app.vault.cachedRead(file).then((content: string) => {
      if (!content) return;

      const lines = content.split("\n").map(trim).filter(identity);

      let currentKey = "";
      let readingProperties = false;

      for (const i in lines) {
        const line = lines[i];

        // Switch properties parsing mode
        if (i == "0" && line === "---") {
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
          // Remove wrapping quotation marks
          if (templateValue.length > 1) {
            if (templateValue[0] === templateValue[templateValue.length - 1]) {
              if (templateValue[0] === "'" || templateValue[0] === '"') {
                templateValue = templateValue.replace(/^['"]|['"]$/g, "");
              }
            }
          }

          const newTemplate = templateValue
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");
          // Ignore blank templates
          if (!newTemplate) continue;

          if (
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
          currentKey = line.replace(/#/g, "").trim().toLowerCase();
          values[currentKey] = [];
          continue;
        }

        values[DEFAULT].push(line);
        if (currentKey) values[currentKey].push(line);
      }

      this.customTables.push({
        tabName,
        fileName: type,
        values: values,
      });
    });

    const getValuesForKey = (key: string): string[] => {
      let result: string[] | undefined;

      // Sections in this file
      const sectionKey = Object.keys(values).find((value) =>
        compareWords(value, key)
      );
      if (sectionKey) {
        result = values[sectionKey];
        if (result?.length) return result;
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
        for (let i = 0; i < keyParts.length; i++) {
          const otherTableKey = keyParts
            .slice(keyParts.length - i - 1)
            .join("/");
          const otherTableSectionKey = Object.keys(
            otherCustomTable.values
          ).find((value) => compareWords(value, otherTableKey));
          if (otherTableSectionKey) {
            result = otherCustomTable.values[otherTableSectionKey];
            if (result?.length) return result;
          }
        }
        if (keyParts.length === 1) {
          result = otherCustomTable.values[DEFAULT];
          if (result?.length) return result;
        }
      }

      // Default generic
      result = getDefaultDictionary(key);
      if (result?.length) return result;

      return [];
    };

    const getValuesForKeys = (key: string): string[] => {
      const keys = key.split("|").map(trim);
      const result = keys.map(getValuesForKey).flat();
      if (result?.length) {
        return result;
      } else {
        return [`{${key}}`];
      }
    };

    const replace = (lastSubs: Record<string, string>) => (wkey: string) => {
      const key = wkey.replace(/{|}/g, "").trim().toLowerCase();
      if (!key) return "";
      return (lastSubs[key] = randomFrom(
        getValuesForKeys(key),
        lastSubs[key] || null
      ));
    };

    const generateCustomWord = (): string => {
      if (templates.length) {
        const template = randomFrom(templates);
        const lastSubs: Record<string, string> = {};

        let result = template;
        for (let i = 0; i < 5; i++) {
          const newResult = result.replace(/{+ ?[^}]+ ?}+/g, replace(lastSubs));
          if (newResult === result) break;
          result = newResult;
        }
        result = result.trim();

        if (template.startsWith("capitalize!")) {
          return capitalize(result.replace("capitalize!", ""));
        } else if (template.startsWith("upcase!")) {
          return result.replace("upcase!", "").toUpperCase();
        } else {
          return result;
        }
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
        this.words.push([type, value]);
        this.addResult(type, value);
      });
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

import { TFile, TFolder, ButtonComponent, DropdownComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import {
  generateWord,
  randomFrom,
  clickToCopy,
  getCustomDictionary,
  capitalize,
} from "../utils";

const MAX_REMEMBER_SIZE = 100;
const DEFAULT = "DEFAULT";

const wordLabels: { [word: string]: string } = {
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
  words: [string, string][];
  tab: string;
  tabSelect: DropdownComponent;
  tabContainerEl: HTMLElement;
  tabEls: Record<string, HTMLElement>;
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
      this.tabSelect = new DropdownComponent(
        this.view.tabViewEl.createDiv("word-select")
      );
    }

    this.tabContainerEl = this.view.tabViewEl.createDiv(
      "Word-buttons-container"
    );
    this.tabEls = {};

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("word-results");
    } else {
      this.tabSelect = new DropdownComponent(
        this.view.tabViewEl.createDiv("word-select")
      );
    }

    // Populate layout
    this.createWordBtn("Characters", "npcName");
    this.createWordBtn("Characters", "npcAspects");
    this.createWordBtn("Characters", "npcSkills");
    this.createWordBtn("Characters", "npcJob");
    this.createWordBtn("Locations", "locName");
    this.createWordBtn("Locations", "locDescription");
    this.createWordBtn("Locations", "locBuilding");
    this.createWordBtn("Locations", "locWilderness");

    if (this.view.settings.customTableRoot) {
      const folder = this.view.app.vault.getFolderByPath(
        this.view.settings.customTableRoot
      );
      if (folder) {
        this.createCustomWordBtns(folder);
      }
    }

    const defaultTab = Object.keys(this.tabEls)[0];
    this.tabSelect.onChange(this.setTab.bind(this));
    this.tabSelect.setValue(this.tab || defaultTab);
    this.setTab(this.tab || defaultTab);

    if (Object.keys(this.tabEls).length == 1) {
      this.tabEls[defaultTab].classList.add("shown");
      this.tabSelect.selectEl.style.display = "none";
    }

    this.repopulateResults();
  }

  reset() {
    this.words = [];
    this.resultsEl.empty();
  }

  setTab(newTab: string) {
    this.tab = newTab;
    for (const tabName in this.tabEls) {
      if (tabName === newTab) {
        this.tabEls[tabName].classList.add("shown");
      } else {
        this.tabEls[tabName].classList.remove("shown");
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
    if (!this.tabEls[tabName]) {
      this.tabEls[tabName] = this.tabContainerEl.createDiv("word-buttons");
      this.tabSelect.addOption(tabName, tabName);
    }

    const label = wordLabels[type] || capitalize(type);
    new ButtonComponent(this.tabEls[tabName])
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
    const values: Record<string, string[]> = { [DEFAULT]: [] };

    this.view.app.vault.cachedRead(file).then((content: string) => {
      if (!content) return;

      const lines = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line);

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
          const newTemplate = line
            .substring(line.indexOf(":") + 1)
            .trim()
            .replace(/^"|"$/g, "")
            .toLowerCase();
          if (templateKey === templateKey.toUpperCase()) {
            templates.push("upcase!" + newTemplate);
          } else if (templateKey === capitalize(templateKey)) {
            templates.push("capitalize!" + newTemplate);
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
    });

    const getValuesForKey = (key: string): string[] => {
      return (
        values[key] ||
        values[key + "s"] ||
        values[key.replace(/y$/, "ies")] ||
        getCustomDictionary(key) || [`{${key}}`]
      );
    };

    const generateCustomWord = (): string => {
      if (templates.length) {
        const template = randomFrom(templates);
        const lastSubs: Record<string, string> = {};
        const result = template
          .replace(/{+ ?[^}]+ ?}+/g, (wkey: string) => {
            const key = wkey.replace(/{|}/g, "").trim().toLowerCase();
            if (!key) return "";
            return (lastSubs[key] = randomFrom(
              getValuesForKey(key),
              lastSubs[key] || null
            ));
          })
          .trim();
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

    if (!this.tabEls[tabName]) {
      this.tabEls[tabName] = this.tabContainerEl.createDiv("word-buttons");
      this.tabSelect.addOption(tabName, tabName);
    }

    new ButtonComponent(this.tabEls[tabName])
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

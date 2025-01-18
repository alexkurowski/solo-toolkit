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
  randomFrom,
  clickToCopy,
  capitalize,
  trim,
} from "../../utils";
import { TabSelect } from "../shared/tabselect";
import {
  wordLabels,
  wordTooltips,
  DEFAULT,
  MAX_REMEMBER_SIZE,
} from "./constants";
import { CustomTableCategory } from "./types";
import { parseKeyWithCurve } from "./parser";
import { CustomDict } from "./customdict";

export class WordView {
  view: View;
  dicts: Record<string, CustomDict>;
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
    this.dicts = {};
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
    const tabName = folder.name.replace(/\.$/, "");
    const [type] = parseKeyWithCurve(file.basename);

    const dictKey = [...path, type].join("/");
    if (!this.dicts[dictKey]) {
      this.dicts[dictKey] = new CustomDict(this, tabName);
    }
    this.dicts[dictKey].parseFile(file, {
      path,
      tabName,
      fileName: type,
    });

    // Skip creating tab/button for hidden folder
    if (
      folder.name.endsWith(".") ||
      path.some((folderName) => folderName.endsWith("."))
    )
      return;

    if (!this.tabContentEls[tabName]) {
      this.tabContentEls[tabName] =
        this.tabContainerEl.createDiv("word-buttons");
      this.tabSelect.addOption(tabName, tabName);
    }

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        const values = this.dicts[dictKey].generateWord();
        if (values.every((value) => !value)) return;
        for (let value of values) {
          if (value === `{${DEFAULT}}`) continue;
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

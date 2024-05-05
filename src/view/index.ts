import {
  TFile,
  ItemView,
  ButtonComponent,
  WorkspaceLeaf,
  Platform,
} from "obsidian";
import { SoloToolkitSettings } from "../settings";
import { roll, rollIntervals, generateWord, randomFrom } from "../utils";

export const VIEW_TYPE = "MAIN_VIEW";

export class SoloToolkitView extends ItemView {
  settings: SoloToolkitSettings;
  isMobile: boolean = false;

  tab: "dice" | "word" = "dice";
  tabEl: HTMLElement;
  tabPickerEl: HTMLElement;

  wordEl: HTMLElement;
  wordResultsEl: HTMLElement;

  diceEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf, settings: SoloToolkitSettings) {
    super(leaf);
    this.settings = settings;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getIcon() {
    return "srt-ribbon";
  }

  getDisplayText() {
    return "Solo RPG Toolkit";
  }

  async onOpen() {
    const parent = this.contentEl;
    parent.empty();

    this.isMobile =
      (this.app as any).isMobile || Platform.isIosApp || Platform.isAndroidApp;

    this.containerEl = parent.createDiv("srt-container");
    this.tabEl = this.containerEl.createDiv("srt-tab");
    this.tabPickerEl = this.containerEl.createDiv("srt-tab-picker");

    if (this.isMobile) {
      this.containerEl.classList.add("srt-mobile-layout");
    } else {
      this.containerEl.classList.add("srt-desktop-layout");
    }

    this.createTabPicker();
    this.createTab();
  }

  async onClose() {
    return super.onClose();
  }

  createTabPicker() {
    this.tabPickerEl.empty();

    const wordBtn = new ButtonComponent(this.tabPickerEl).setButtonText(
      "Ideas",
    );
    const diceBtn = new ButtonComponent(this.tabPickerEl).setButtonText("Dice");

    wordBtn.onClick(() => {
      this.tab = "word";
      wordBtn.setCta();
      diceBtn.removeCta();
      this.createTab();
    });
    diceBtn.onClick(() => {
      this.tab = "dice";
      diceBtn.setCta();
      wordBtn.removeCta();
      this.createTab();
    });

    if (this.tab === "word") wordBtn.setCta();
    if (this.tab === "dice") diceBtn.setCta();
  }

  createTab() {
    this.tabEl.empty();

    if (this.tab === "word") {
      if (this.isMobile) {
        this.wordResultsEl = this.tabEl.createDiv("word-results");
      }

      this.wordEl = this.tabEl.createDiv("word-container");
      this.wordEl.empty();
      this.createWord("Subject");
      this.createWord("Action");
      this.createWord("Name");
      this.createWord("Looks");
      this.createWord("Job");

      if (this.settings.customTableRoot) {
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
          if (file.parent?.path === this.settings.customTableRoot) {
            this.createCustomWord(file);
          }
        }
      }

      if (!this.isMobile) {
        this.wordResultsEl = this.tabEl.createDiv("word-results");
      }
    }

    if (this.tab === "dice") {
      this.diceEl = this.tabEl.createDiv("dice-container");
      this.diceEl.empty();
      this.createDice(4);
      this.createDice(6);
      this.createDice(8);
      this.createDice(10);
      this.createDice(12);
      this.createDice(20);
    }
  }

  createDice(d: number) {
    const container = this.diceEl.createDiv(`dice-variant dice-variant-${d}`);

    const results = container.createDiv(`dice-results dice-results-${d}`);

    const button = new ButtonComponent(container)
      .setIcon(`srt-d${d}`)
      .setTooltip(`Roll d${d}`)
      .onClick(() => {
        this.addDiceRoll(results, d);
      });
  }

  addDiceRoll(container: any, max: number) {
    let value = roll(max);
    const el = container.createDiv("dice-result-value");
    el.setText(value);

    let i = 0;
    const reroll = () => {
      value = roll(max, value);
      el.setText(value);
      i++;
      if (rollIntervals[i]) {
        setTimeout(reroll, rollIntervals[i]);
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  createWord(value: string) {
    const button = new ButtonComponent(this.wordEl)
      .setButtonText(value)
      .setTooltip(`Generate ${value.toLowerCase()}`)
      .onClick(() => {
        const el = this.wordResultsEl.createDiv("word-result");
        const type = el.createSpan("word-result-type");
        type.setText(value);
        const result = el.createSpan("word-result-value");
        result.setText(generateWord(value));
        setTimeout(() => {
          el.classList.add("shown");
        }, 30);
      });
  }

  createCustomWord(file: TFile) {
    const value = file.basename;
    let words: string[] = [];

    this.app.vault.cachedRead(file).then((content: string) => {
      if (!content) return;

      words = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line);
    });

    const button = new ButtonComponent(this.wordEl)
      .setButtonText(value)
      .setTooltip(`Generate ${value.toLowerCase()}`)
      .onClick(() => {
        if (!words.length) return;

        const el = this.wordResultsEl.createDiv("word-result");
        const type = el.createSpan("word-result-type");
        type.setText(value);
        const result = el.createSpan("word-result-value");
        result.setText(randomFrom(words));
        setTimeout(() => {
          el.classList.add("shown");
        }, 30);
      });
  }
}

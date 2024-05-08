import {
  ItemView,
  ExtraButtonComponent,
  WorkspaceLeaf,
  Platform,
} from "obsidian";
import { DiceView } from "./dice";
import { DeckView } from "./deck";
import { WordView } from "./word";
import { SoloToolkitSettings } from "../settings";

export const VIEW_TYPE = "MAIN_VIEW";

const resetTimeout = 800;

const tabLabels = {
  dice: "Dice",
  deck: "Deck",
  word: "Ideas",
};

export class SoloToolkitView extends ItemView {
  public settings: SoloToolkitSettings;
  public isMobile: boolean = false;

  public tab: "dice" | "deck" | "word" = "dice";
  tabPickerEl: HTMLElement;
  public tabViewEl: HTMLElement;

  public dice: DiceView;
  public deck: DeckView;
  public word: WordView;

  constructor(leaf: WorkspaceLeaf, settings: SoloToolkitSettings) {
    super(leaf);
    this.settings = settings;
    this.dice = new DiceView(this);
    this.deck = new DeckView(this);
    this.word = new WordView(this);
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
    this.tabViewEl = this.containerEl.createDiv("srt-tab");
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

    const resetBtn = new ExtraButtonComponent(this.tabPickerEl)
      .setIcon("refresh-ccw")
      .setTooltip(`Reset ${tabLabels[this.tab].toLowerCase()}`)
      .onClick(() => {
        if (this.tab === "word") this.word.reset();
        if (this.tab === "deck") this.deck.reset();
        if (this.tab === "dice") this.dice.reset();
      });
    const updateResetBtnTooltip = () =>
      resetBtn.setTooltip(`Reset ${tabLabels[this.tab].toLowerCase()}`);

    const btnsEl = this.tabPickerEl.createDiv("srt-tab-picker-tabs");
    const btns = {
      word: new ExtraButtonComponent(btnsEl)
        .setIcon("lightbulb")
        .setTooltip(tabLabels.word),
      deck: new ExtraButtonComponent(btnsEl)
        .setIcon("heart")
        .setTooltip(tabLabels.deck),
      dice: new ExtraButtonComponent(btnsEl)
        .setIcon("dices")
        .setTooltip(tabLabels.dice),
    };

    const setCta = (tab: keyof typeof btns) => {
      for (const btn of Object.values(btns)) {
        if (btn === btns[tab]) {
          btn.extraSettingsEl.classList.add("highlight");
        } else {
          btn.extraSettingsEl.classList.remove("highlight");
        }
      }
    };

    setCta(this.tab);

    let lastBtnClickAt = 0;
    const maybeReset = (tab: keyof typeof btns) => {
      if (this.tab === tab) {
        const now = Date.now();
        if (lastBtnClickAt && now - lastBtnClickAt <= resetTimeout) {
          this[tab].reset();
          lastBtnClickAt = 0;
        } else {
          lastBtnClickAt = now;
        }
      } else {
        lastBtnClickAt = 0;
      }
    };

    const btnOnClick = (tab: keyof typeof btns) => () => {
      maybeReset(tab);
      this.tab = tab;
      setCta(tab);
      this.createTab();
      updateResetBtnTooltip();
    };
    btns.word.onClick(btnOnClick("word"));
    btns.deck.onClick(btnOnClick("deck"));
    btns.dice.onClick(btnOnClick("dice"));
  }

  createTab() {
    this.tabViewEl.empty();

    if (this.tab === "word") {
      this.word.create();
    }
    if (this.tab === "deck") {
      this.deck.create();
    }
    if (this.tab === "dice") {
      this.dice.create();
    }
  }
}

import { ItemView, ButtonComponent, WorkspaceLeaf, Platform } from "obsidian";
import { DiceView } from "./dice";
import { DeckView } from "./deck";
import { WordView } from "./word";
import { SoloToolkitSettings } from "../settings";

export const VIEW_TYPE = "MAIN_VIEW";

export class SoloToolkitView extends ItemView {
  public settings: SoloToolkitSettings;
  public isMobile: boolean = false;

  tab: "dice" | "deck" | "word" = "dice";
  tabPickerEl: HTMLElement;
  public tabViewEl: HTMLElement;

  dice: DiceView;
  deck: DeckView;
  word: WordView;

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

    const btns = {
      word: new ButtonComponent(this.tabPickerEl).setButtonText("Ideas"),
      deck: new ButtonComponent(this.tabPickerEl).setButtonText("Deck"),
      dice: new ButtonComponent(this.tabPickerEl).setButtonText("Dice"),
    };

    const setCta = (btn: keyof typeof btns) => {
      for (const btn of Object.values(btns)) {
        btn.removeCta();
      }
      btns[btn].setCta();
    };

    setCta(this.tab);

    btns.word.onClick(() => {
      this.tab = "word";
      setCta("word");
      this.createTab();
    });
    btns.deck.onClick(() => {
      this.tab = "deck";
      setCta("deck");
      this.createTab();
    });
    btns.dice.onClick(() => {
      this.tab = "dice";
      setCta("dice");
      this.createTab();
    });
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

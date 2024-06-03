import {
  ItemView,
  ExtraButtonComponent,
  WorkspaceLeaf,
  Platform,
} from "obsidian";
import { PluginApp } from "../main";
import { DiceView } from "./dice";
import { DeckView } from "./deck";
import { WordView } from "./word";
import { OracleView } from "./oracle";
import { MapView } from "./map";
import { SoloToolkitSettings } from "../settings";

export const VIEW_TYPE = "MAIN_VIEW";

const tabLabels = {
  dice: "Dice",
  deck: "Deck",
  oracle: "Oracle",
  word: "Ideas",
  map: "Maps",
};

export class SoloToolkitView extends ItemView {
  public settings: SoloToolkitSettings;
  public isMobile: boolean = false;

  public tab: "dice" | "deck" | "oracle" | "word" | "map" = "dice";
  tabPickerEl: HTMLElement;
  public tabViewEl: HTMLElement;

  public dice: DiceView;
  public deck: DeckView;
  public word: WordView;
  public oracle: OracleView;
  public map: MapView;

  constructor(leaf: WorkspaceLeaf, settings: SoloToolkitSettings) {
    super(leaf);
    this.settings = settings;
    this.dice = new DiceView(this);
    this.deck = new DeckView(this);
    this.word = new WordView(this);
    this.oracle = new OracleView(this);
    this.map = new MapView(this);
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
      (this.app as PluginApp).isMobile ||
      Platform.isIosApp ||
      Platform.isAndroidApp;

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
        if (this.tab === "map") this.map.reset();
        if (this.tab === "word") this.word.reset();
        if (this.tab === "oracle") this.oracle.reset();
        if (this.tab === "deck") this.deck.reset();
        if (this.tab === "dice") this.dice.reset();
      });
    const updateResetBtnTooltip = () =>
      resetBtn.setTooltip(`Reset ${tabLabels[this.tab].toLowerCase()}`);

    const btnsEl = this.tabPickerEl.createDiv("srt-tab-picker-tabs");
    const btns = {
      map: new ExtraButtonComponent(btnsEl)
        .setIcon("map")
        .setTooltip(tabLabels.map),
      word: new ExtraButtonComponent(btnsEl)
        .setIcon("lightbulb")
        .setTooltip(tabLabels.word),
      oracle: new ExtraButtonComponent(btnsEl)
        .setIcon("eye")
        .setTooltip(tabLabels.oracle),
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

    const btnOnClick = (tab: keyof typeof btns) => () => {
      this.tab = tab;
      if (tab === "dice") this.dice.reset();
      setCta(tab);
      this.createTab();
      updateResetBtnTooltip();
    };
    btns.map.onClick(btnOnClick("map"));
    btns.word.onClick(btnOnClick("word"));
    btns.oracle.onClick(btnOnClick("oracle"));
    btns.deck.onClick(btnOnClick("deck"));
    btns.dice.onClick(btnOnClick("dice"));
  }

  createTab() {
    this.tabViewEl.empty();

    if (this.tab === "map") {
      this.map.create();
    } else if (this.tab === "word") {
      this.word.create();
    } else if (this.tab === "oracle") {
      this.oracle.create();
    } else if (this.tab === "deck") {
      this.deck.create();
    } else if (this.tab === "dice") {
      this.dice.create();
    }
  }
}

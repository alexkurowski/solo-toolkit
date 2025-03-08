import { App, Setting, PluginSettingTab } from "obsidian";
import SoloToolkitPlugin from "../main";

export type ViewType = "dice" | "deck" | "oracle" | "word";
type DeckClipboardMode = "" | "md" | "path" | "png";
type DiceClipboardMode =
  | "plain"
  | "parenthesis"
  | "square"
  | "curly"
  | "code"
  | "code+parenthesis"
  | "code+square"
  | "code+curly"
  | "inline"
  | "inline-small"
  | "inline-large";
type WordClipboardMode = "plain" | "code";
type ProgressMode = "track" | "clock" | "small_clock" | "big_clock";

export interface SoloToolkitSettings {
  defaultView: ViewType;
  customTableRoot: string;
  customDeckRoot: string;
  disableDefaultWords: boolean;
  deckJokers: boolean;
  deckFlip: boolean;
  deckTarot: boolean; // obsolete
  deckClipboard: boolean; // obsolete
  deckClipboardMode: DeckClipboardMode;
  diceClipboardMode: DiceClipboardMode;
  wordClipboardMode: WordClipboardMode;
  diceDeleteOnCopy: boolean;
  inlineCounters: boolean;
  inlineProgressMode: ProgressMode;
  inlineDynamicEdit: boolean; // unused
  standardOracleBias: boolean;
  standardOracleEvents: boolean;
  oracleLanguage: string;

  wordTab: string;
  oracleTab: string;
  deckTab: string;
  mythicFactor: number;
  wordQuickValue: string;
  wordQuickHeight: number;
}

export const DEFAULT_SETTINGS: SoloToolkitSettings = {
  defaultView: "dice",
  customTableRoot: "Tables",
  customDeckRoot: "Decks",
  disableDefaultWords: false,
  deckJokers: false,
  deckFlip: true,
  deckTarot: true, // deprecated
  deckClipboard: false, // deprecated
  deckClipboardMode: "md",
  diceClipboardMode: "inline",
  wordClipboardMode: "plain",
  diceDeleteOnCopy: false,
  inlineCounters: false,
  inlineProgressMode: "clock",
  inlineDynamicEdit: true, // deprecated
  standardOracleBias: false,
  standardOracleEvents: false,
  oracleLanguage: "en",

  wordTab: "",
  oracleTab: "",
  deckTab: "",
  mythicFactor: 5,
  wordQuickValue: "",
  wordQuickHeight: 100,
};

export class SoloToolkitSettingTab extends PluginSettingTab {
  plugin: SoloToolkitPlugin;

  constructor(app: App, plugin: SoloToolkitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName("Sidebar").setHeading();

    new Setting(containerEl)
      .setName("Default sidebar view")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("dice", "Dice")
          .addOption("deck", "Deck")
          .addOption("oracle", "Oracle")
          .addOption("word", "Ideas");
        dropdown.setValue(this.plugin.settings.defaultView || "dice");
        dropdown.onChange(async (value: ViewType) => {
          this.plugin.settings.defaultView = value;
          await this.plugin.saveSettings();
        });
      });

    // Sidebar dice
    new Setting(containerEl).setName("Sidebar — dice").setHeading();

    new Setting(containerEl)
      .setName("Dice click behavior")
      .setDesc("What will be copied when you click on a dice roll")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("inline", "`d6 = 4`")
          .addOption("plain", "d6: 4")
          .addOption("parenthesis", "(d6: 4)")
          .addOption("square", "[d6: 4]")
          .addOption("curly", "{d6: 4}")
          .addOption("code", "`d6: 4`")
          .addOption("code+parenthesis", "`(d6: 4)`")
          .addOption("code+square", "`[d6: 4]`")
          .addOption("code+curly", "`{d6: 4}`");
        dropdown.setValue(this.plugin.settings.diceClipboardMode || "");
        dropdown.onChange(async (value: DiceClipboardMode) => {
          this.plugin.settings.diceClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Remove dice roll on copy")
      .setDesc(
        "Right click (long press on mobile) to copy and remove all rolls"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.diceDeleteOnCopy)
          .onChange(async (value) => {
            this.plugin.settings.diceDeleteOnCopy = value;
            await this.plugin.saveSettings();
          })
      );

    // Sidebar decks
    new Setting(containerEl).setName("Sidebar — decks").setHeading();

    new Setting(containerEl)
      .setName("Decks folder")
      .setDesc("Additional decks can be added in subfolders in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Decks")
          .setValue(this.plugin.settings.customDeckRoot)
          .onChange(async (value) => {
            this.plugin.settings.customDeckRoot = normalizePath(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Click on card")
      .setDesc("What will be copied when you click on a drawn card")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("", "Off")
          .addOption("md", "Markdown link (paste into notes)")
          .addOption("png", "Image (paste outside Obsidian)");
        dropdown.setValue(this.plugin.settings.deckClipboardMode || "");
        dropdown.onChange(async (value: DeckClipboardMode) => {
          this.plugin.settings.deckClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Default decks — jokers")
      .setDesc("Requires reset to take effect")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckJokers)
          .onChange(async (value) => {
            this.plugin.settings.deckJokers = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default decks — upside down cards")
      .setDesc("Requires reset to take effect")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckFlip)
          .onChange(async (value) => {
            this.plugin.settings.deckFlip = value;
            await this.plugin.saveSettings();
          })
      );

    // Sidebar oracle and ideas
    new Setting(containerEl)
      .setName("Sidebar — oracle & random tables")
      .setHeading();

    new Setting(containerEl)
      .setName("Random tables folder")
      .setDesc("Additional random tables can be added in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Tables")
          .setValue(this.plugin.settings.customTableRoot)
          .onChange(async (value) => {
            this.plugin.settings.customTableRoot = normalizePath(value || "");
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Hide default random generators")
      .setDesc(
        "Make sure to add your own custom tables to the folder specified in the above option"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.disableDefaultWords)
          .onChange(async (value) => {
            this.plugin.settings.disableDefaultWords = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Click on result")
      .setDesc("What will be copied when you click on a generated phrase")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("plain", "Plain text")
          .addOption("code", "`Inilne code`");
        dropdown.setValue(this.plugin.settings.wordClipboardMode || "");
        dropdown.onChange(async (value: WordClipboardMode) => {
          this.plugin.settings.wordClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Oracle language")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("en", "English")
          .addOption("zh", "Chinese")
          .addOption("fr", "French")
          .addOption("de", "German")
          .addOption("hi", "Hindi")
          .addOption("ja", "Japanese")
          .addOption("pt", "Portuguese")
          .addOption("es", "Spanish");
        dropdown.setValue(this.plugin.settings.oracleLanguage || "en");
        dropdown.onChange(async (value: ViewType) => {
          this.plugin.settings.oracleLanguage = value;
          await this.plugin.saveSettings();
        });
      });

    // Inline elements
    new Setting(containerEl).setName("Inline elements").setHeading();

    new Setting(containerEl)
      .setName("Enable inline elements")
      .setDesc(
        newDesc(
          "Counter — `1`",
          "Progress boxes — `boxes: 1/5`, `b:1/5`",
          "Progress clock — `clock: 1/6`, `c:1/6`",
          "Dice — `d20`, `2d6`",
          "Tab stop — ` `"
        )
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.inlineCounters)
          .onChange(async (value) => {
            this.plugin.settings.inlineCounters = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default progress trackers")
      .setDesc(
        newDesc(
          "Default progress — `1/5`",
          "Boxes can count up to 200, clocks up to 16"
        )
      )
      .addDropdown((dropdown) => {
        dropdown
          .addOption("track", "Boxes")
          .addOption("clock", "Clock")
          .addOption("small_clock", "Clock (smaller)")
          .addOption("big_clock", "Clock (larger)");
        dropdown.setValue(this.plugin.settings.inlineProgressMode || "");
        dropdown.onChange(async (value: ProgressMode) => {
          this.plugin.settings.inlineProgressMode = value;
          await this.plugin.saveSettings();
        });
      });
  }
}

const normalizePath = (value: string): string => {
  return (value || "").replace(/^\/+|\/+$/g, "");
};

const newDesc = (...lines: string[]) => {
  const el = new DocumentFragment();

  for (const line of lines) {
    const lineEl = document.createElement("div");
    lineEl.innerText = line;
    el.append(lineEl);
  }

  return el;
};

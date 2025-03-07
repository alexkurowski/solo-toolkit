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
  inlineDynamicEdit: boolean;
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
  diceClipboardMode: "code",
  wordClipboardMode: "plain",
  diceDeleteOnCopy: false,
  inlineCounters: false,
  inlineProgressMode: "clock",
  inlineDynamicEdit: true,
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

    new Setting(containerEl)
      .setName("Custom tables folder")
      .setDesc("Additional random tables can be added in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Tables")
          .setValue(this.plugin.settings.customTableRoot)
          .onChange(async (value) => {
            this.plugin.settings.customTableRoot = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Custom decks folder")
      .setDesc("Additional decks can be added in subfolders in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Decks")
          .setValue(this.plugin.settings.customDeckRoot)
          .onChange(async (value) => {
            this.plugin.settings.customDeckRoot = value;
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
      .setName("Add 2 jokers to standard deck")
      .setDesc("Don't forget to shuffle after changing this")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckJokers)
          .onChange(async (value) => {
            this.plugin.settings.deckJokers = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Add upside down cards to default decks")
      .setDesc("Don't forget to shuffle after changing this")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckFlip)
          .onChange(async (value) => {
            this.plugin.settings.deckFlip = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Dice click behavior")
      .setDesc("What will be copied when you click on a dice roll result")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("plain", "d6: 4")
          .addOption("parenthesis", "(d6: 4)")
          .addOption("square", "[d6: 4]")
          .addOption("curly", "{d6: 4}")
          .addOption("code", "`d6: 4`")
          .addOption("code+parenthesis", "`(d6: 4)`")
          .addOption("code+square", "`[d6: 4]`")
          .addOption("code+curly", "`{d6: 4}`")
          .addOption("inline", "`d6 = 4`");
        dropdown.setValue(this.plugin.settings.diceClipboardMode || "");
        dropdown.onChange(async (value: DiceClipboardMode) => {
          this.plugin.settings.diceClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Card click behavior")
      .setDesc("What will be copied when you click on a drawn card")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("", "Off")
          .addOption("md", "Markdown link (paste into notes)")
          .addOption("path", "File path (paste into Excalidraw plugin)")
          .addOption("png", "Image (paste outside Obsidian)");
        dropdown.setValue(this.plugin.settings.deckClipboardMode || "");
        dropdown.onChange(async (value: DeckClipboardMode) => {
          this.plugin.settings.deckClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Oracle and random table results click behavior")
      .setDesc("What will be copied when you click on a phrase result")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("plain", "Plain text")
          .addOption("code", "Inilne code");
        dropdown.setValue(this.plugin.settings.wordClipboardMode || "");
        dropdown.onChange(async (value: WordClipboardMode) => {
          this.plugin.settings.wordClipboardMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Enable inline elements")
      .setDesc(
        "Typing `1` will render a dynamic counter, typing `1/5` will render a progress tracker, typing ` ` will render a tab stop"
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
      .setName("Default style of inline progress trackers")
      .setDesc("Boxes can count up to 200, clocks up to 16")
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

    new Setting(containerEl)
      .setName("Yes/no oracle language")
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
  }
}

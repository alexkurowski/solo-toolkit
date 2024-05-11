import { App, Setting, PluginSettingTab } from "obsidian";
import SoloToolkitPlugin from "../main";

export interface SoloToolkitSettings {
  customTableRoot: string;
  deckJokers: boolean;
  inlineCounters: boolean;
}

export const DEFAULT_SETTINGS: SoloToolkitSettings = {
  customTableRoot: "Tables",
  deckJokers: false,
  inlineCounters: false,
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

    containerEl.createEl("h1", { text: "Solo RPG Toolkit settings" });

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
          }),
      );

    new Setting(containerEl)
      .setName("Add jokers to the deck")
      .setDesc("Don't forget to shuffle after changing this")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckJokers)
          .onChange(async (value) => {
            this.plugin.settings.deckJokers = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Enable inline counters")
      .setDesc(
        "Typing `1` will render a dynamic counter, typing `1/5` will render a progress tracker",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.inlineCounters)
          .onChange(async (value) => {
            this.plugin.settings.inlineCounters = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}

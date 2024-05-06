import { App, Setting, Plugin, PluginSettingTab } from "obsidian";

export interface SoloToolkitSettings {
  customTableRoot: string;
  deckJokers: boolean;
}

export const DEFAULT_SETTINGS: SoloToolkitSettings = {
  customTableRoot: "Tables",
  deckJokers: false,
};

export class SoloToolkitSettingTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: Plugin) {
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
  }
}

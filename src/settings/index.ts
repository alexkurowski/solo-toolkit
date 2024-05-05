import { App, Setting, Plugin, PluginSettingTab } from "obsidian";

export interface SoloToolkitSettings {
  customTableRoot: string;
}

export const DEFAULT_SETTINGS: SoloToolkitSettings = {
  customTableRoot: "Tables",
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
      .setDesc("Additional can be created in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Tables")
          .setValue(this.plugin.settings.customTableRoot)
          .onChange(async (value) => {
            this.plugin.settings.customTableRoot = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}

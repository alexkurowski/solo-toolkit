import { App, Plugin, WorkspaceLeaf } from "obsidian";
import { registerIcons } from "./icons";
import {
  SoloToolkitSettingTab,
  SoloToolkitSettings,
  DEFAULT_SETTINGS,
} from "./settings";
import { SoloToolkitView, VIEW_TYPE } from "./view";

export default class SoloToolkitPlugin extends Plugin {
  settings: SoloToolkitSettings;

  async onload() {
    await this.loadSettings();

    registerIcons();

    this.registerView(
      VIEW_TYPE,
      (leaf) => new SoloToolkitView(leaf, this.settings),
    );

    const ribbonIconEl = this.addRibbonIcon(
      "srt-ribbon",
      "Solo RPG Toolkit",
      async (evt: MouseEvent) => {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE);

        if (leaves.length > 0) {
          leaf = leaves[0];
        } else {
          leaf = workspace.getRightLeaf(false);
          if (leaf) {
            await leaf.setViewState({ type: VIEW_TYPE, active: true });
          }
        }

        if (leaf) {
          workspace.revealLeaf(leaf);
        }
      },
    );

    this.addSettingTab(new SoloToolkitSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

import { Plugin, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import { registerIcons, unregisterIcons } from "./icons";
import {
  SoloToolkitSettingTab,
  SoloToolkitSettings,
  DEFAULT_SETTINGS,
} from "./settings";
import { SoloToolkitView, VIEW_TYPE } from "./view";
import { VttView, VTT_VIEW_TYPE, VTT_EXT } from "./view/vtt";
import { soloToolkitExtension } from "./extension";
import { soloToolkitPostprocessor } from "./postprocessor";
import { exportDeck } from "./utils/deck";
import deckImages from "./icons/deck";
import tarotImages from "./icons/tarot";

export default class SoloToolkitPlugin extends Plugin {
  settings: SoloToolkitSettings;

  async onload() {
    await this.loadSettings();

    registerIcons();
    await exportDeck(this.app.vault, "standard", deckImages);
    await exportDeck(this.app.vault, "tarot", tarotImages);

    this.registerView(
      VIEW_TYPE,
      (leaf) =>
        new SoloToolkitView(leaf, this.settings, this.saveSetting.bind(this))
    );

    this.registerMarkdownPostProcessor(soloToolkitPostprocessor(this));
    this.registerEditorExtension(soloToolkitExtension(this));

    this.registerView(VTT_VIEW_TYPE, (leaf) => new VttView(leaf, this));
    this.registerExtensions([VTT_EXT], VTT_VIEW_TYPE);

    this.addRibbonIcon("srt-ribbon", "Solo RPG Toolkit", () => this.openView());

    this.addCommand({
      id: "open-toolkit",
      name: "Open toolkit",
      callback: () => this.openView(),
    });

    this.addCommand({
      id: "create-new-vtt",
      name: "Create new VTT",
      callback: () => this.createVttFile(),
    });

    this.addSettingTab(new SoloToolkitSettingTab(this.app, this));
  }

  onunload() {
    unregisterIcons();
  }

  async openView() {
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
  }

  async createVttFile(folder?: TFolder) {
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent(
          this.app.workspace.getActiveFile()?.path || ""
        );

    try {
      const file: TFile = await (this.app.fileManager as any).createNewFile(
        targetFolder,
        `Untitled.${VTT_EXT}`
      );

      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.openFile(file, { active: true });
      await leaf.setViewState({
        type: VTT_VIEW_TYPE,
        state: leaf.view.getState(),
      });
      this.app.workspace.revealLeaf(
        this.app.workspace.getLeavesOfType(VTT_VIEW_TYPE)[0]
      );
    } catch (e) {
      console.error("Error creating vtt:", e);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSetting(setting: Partial<SoloToolkitSettings>) {
    Object.assign(this.settings, setting);
    return this.saveSettings();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

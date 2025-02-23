import { TextFileView, TFile, WorkspaceLeaf } from "obsidian";
import VttPlugin from "src/main";
import { VttApp } from "./app";

export const VTT_VIEW_TYPE = "vtt";
export const VTT_EXT = "vtt";

export class VttView extends TextFileView {
  plugin: VttPlugin;
  root: VttApp;

  constructor(leaf: WorkspaceLeaf, plugin: VttPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  async onLoadFile(file: TFile) {
    this.file = file;
    this.render(file);
  }

  async onUnloadFile(_file: TFile) {
    this.clear();
  }

  onunload() {
    this.clear();
  }

  getViewData() {
    return this.data;
  }

  setViewData(data: string, clear?: boolean) {
    this.data = data;
    if (clear) {
      this.clear();
    }
  }

  async onClose() {
    this.clear();
  }

  getViewType() {
    return VTT_VIEW_TYPE;
  }

  clear() {
    this.setViewData("");
    this.root?.clear();
  }

  getContainer() {
    return this.containerEl.children[1];
  }

  async render(file: TFile) {
    const fileData = await this.app.vault.cachedRead(file);
    this.setViewData(fileData);

    const container = this.getContainer();
    container.classList.add("srt-vtt-root");

    if (this.root) {
      this.root.update(fileData);
    } else {
      this.root = new VttApp(container, this.app, fileData);
    }
  }
}

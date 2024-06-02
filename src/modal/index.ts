import { App, ButtonComponent, Modal } from "obsidian";
import { drawMap } from "../utils/mapgen/draw";
import { TombGenerator } from "../utils/mapgen/tomb";

export class MapgenModal extends Modal {
  map = new TombGenerator();

  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;

    const canvas = contentEl.createEl("canvas");
    canvas.width = 1152;
    canvas.height = 1152;
    canvas.style.width = "528px";
    canvas.style.height = "528px";
    canvas.style.marginLeft = "auto";

    new ButtonComponent(contentEl).setButtonText("Generate").onClick(() => {
      this.map = new TombGenerator();
      const ctx = canvas.getContext("2d");
      if (ctx) drawMap(ctx, this.map);
    });

    const ctx = canvas.getContext("2d");
    if (ctx) drawMap(ctx, this.map);
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

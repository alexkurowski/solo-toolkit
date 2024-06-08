import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { clickToCopy, generateMap } from "../utils";
import { MapBlueprint } from "src/utils/mapgen/shared";
import { drawMap } from "src/utils/mapgen/draw";

const MAX_REMEMBER_SIZE = 20;

export class MapView {
  view: View;
  maps: MapBlueprint[] = [];
  mapBtnsEl: HTMLElement;
  mapResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
  }

  create() {
    if (this.view.isMobile) {
      this.mapResultsEl = this.view.tabViewEl.createDiv("map-results");
    }

    this.mapBtnsEl = this.view.tabViewEl.createDiv("map-buttons");
    this.mapBtnsEl.empty();
    this.createMapBtn("Room");
    this.createMapBtn("Cave");

    if (!this.view.isMobile) {
      this.mapResultsEl = this.view.tabViewEl.createDiv("map-results");
    }

    this.repopulateResults();
  }

  reset() {
    // this.maps = [];
    this.mapResultsEl.empty();
  }

  addResult(map: MapBlueprint, immediate = false) {
    const elClass = ["map-result"];
    if (immediate) elClass.push("nofade");
    const el = this.mapResultsEl.createEl("a", { cls: elClass.join(" ") });

    // TODO:
    // el.onclick = clickToCopy(value);

    const canvasEl = el.createEl("canvas");
    canvasEl.width = 1000;
    canvasEl.height = 1000;
    canvasEl.style.width = "300px";
    canvasEl.style.height = "300px";

    const ctx = canvasEl.getContext("2d");
    if (ctx) drawMap(ctx, map);
  }

  createMapBtn(type: string) {
    new ButtonComponent(this.mapBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate a ${type.toLowerCase()}`)
      .onClick(() => {
        const value = generateMap(type);
        this.maps.push(value);
        this.addResult(value);
      });
  }

  repopulateResults() {
    while (this.maps.length > MAX_REMEMBER_SIZE) {
      this.maps.shift();
    }
    for (const map of this.maps) {
      this.addResult(map, true);
    }
  }
}

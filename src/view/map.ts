import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { PluginApp } from "../main";
import { clickToCopy } from "../utils";

export class MapView {
  view: View;
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
    this.createMapBtn("Tomb");
    this.createMapBtn("Cave");
    this.createMapBtn("Town");

    if (!this.view.isMobile) {
      this.mapResultsEl = this.view.tabViewEl.createDiv("map-results");
    }

    this.repopulateResults();
  }

  reset() {
    // this.maps = [];
    this.mapResultsEl.empty();
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["map-result"];
    if (immediate) elClass.push("nofade");
    const el = this.mapResultsEl.createEl("a", { cls: elClass.join(" ") });
    el.onclick = clickToCopy(value);

    const typeEl = el.createSpan("map-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("map-result-value");
    valueEl.setText(value);
  }

  createMapBtn(type: string) {
    new ButtonComponent(this.mapBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate a ${type.toLowerCase()}`)
      .onClick(() => {
        const app = this.view.app as PluginApp;
        if (app?.commands?.executeCommandById) {
          app.commands.executeCommandById(
            `solo-rpg-toolkit:generate-${type.toLowerCase()}`
          );
        }
        // const value = generateMap(type);
        // this.maps.push([type, value]);
        // this.addResult(type, value);
      });
  }

  repopulateResults() {
    // while (this.maps.length > MAX_REMEMBER_SIZE) {
    //   this.maps.shift();
    // }
    // for (const map of this.maps) {
    //   const [type, value] = map;
    //   this.addResult(type, value, true);
    // }
  }
}

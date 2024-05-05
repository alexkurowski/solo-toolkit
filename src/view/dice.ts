import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { roll, rollIntervals } from "../utils";

export class DiceView {
  view: View;
  diceBtnsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
  }

  create() {
    this.diceBtnsEl = this.view.tabViewEl.createDiv("dice-buttons");
    this.diceBtnsEl.empty();
    this.createDiceBtn(4);
    this.createDiceBtn(6);
    this.createDiceBtn(8);
    this.createDiceBtn(10);
    this.createDiceBtn(12);
    this.createDiceBtn(20);
  }

  addResult(container: HTMLElement, max: number) {
    let value = roll(max);
    const el = container.createDiv("dice-result-value");
    el.setText(value.toString());

    let i = 0;
    const reroll = () => {
      value = roll(max, value);
      el.setText(value.toString());
      i++;
      if (rollIntervals[i]) {
        setTimeout(reroll, rollIntervals[i]);
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  createDiceBtn(d: number) {
    const container = this.diceBtnsEl.createDiv(
      `dice-variant dice-variant-${d}`,
    );

    const results = container.createDiv(`dice-results dice-results-${d}`);

    const button = new ButtonComponent(container)
      .setIcon(`srt-d${d}`)
      .setTooltip(`Roll d${d}`)
      .onClick(() => {
        this.addResult(results, d);
      });
  }
}

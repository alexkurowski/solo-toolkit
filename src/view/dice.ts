import { ExtraButtonComponent, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { roll, rollIntervals } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class DiceView {
  view: View;
  rolls: { [key: number]: number[] } = {};
  btnsEl: HTMLElement;
  resultEls: { [key: number]: HTMLElement } = [];

  constructor(view: View) {
    this.view = view;
  }

  create() {
    this.resultEls = {};
    this.btnsEl = this.view.tabViewEl.createDiv("dice-buttons");
    this.btnsEl.empty();

    this.createDiceBtn(4);
    this.createDiceBtn(6);
    this.createDiceBtn(8);
    this.createDiceBtn(10);
    this.createDiceBtn(12);
    this.createDiceBtn(20);
    this.createDiceBtn(100);

    this.repopulateResults();
  }

  reset() {
    for (const el of Object.values(this.resultEls)) {
      el.empty();
    }
    this.rolls = {};
  }

  addResult(container: HTMLElement, max: number) {
    let value = roll(max);

    this.rolls[max] = this.rolls[max] || [];
    const rollIndex = this.rolls[max].length;
    this.rolls[max][rollIndex] = value;

    const el = container.createDiv("dice-result-value");
    el.setText(value.toString());

    let i = 0;
    const reroll = () => {
      if (this.rolls[max][rollIndex]) {
        value = roll(max, value);
        this.rolls[max][rollIndex] = value;
        el.setText(value.toString());
        i++;
        if (rollIntervals[i]) {
          setTimeout(reroll, rollIntervals[i]);
        } else {
          setTooltip(
            container,
            `Total: ${this.rolls[max].reduce(
              (result, value) => result + (value || 0),
              0
            )}`
          );
        }
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  addImmediateResult(container: HTMLElement, value: number) {
    const el = container.createDiv("dice-result-value");
    el.setText(value.toString());
  }

  createDiceBtn(d: number) {
    const container = this.btnsEl.createDiv(`dice-variant dice-variant-${d}`);

    const resultsEl = container.createDiv(`dice-results dice-results-${d}`);
    this.resultEls[d] = resultsEl;

    new ExtraButtonComponent(container)
      .setIcon(`srt-d${d}`)
      .setTooltip(`Roll d${d}`)
      .onClick(() => {
        this.addResult(resultsEl, d);
      });
  }

  repopulateResults() {
    for (const key in this.rolls) {
      while (this.rolls[key].length > MAX_REMEMBER_SIZE) {
        this.rolls[key].shift();
      }

      for (const value of this.rolls[key]) {
        this.addImmediateResult(this.resultEls[key], value);
      }
    }
  }
}

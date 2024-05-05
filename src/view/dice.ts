import { ButtonComponent, ExtraButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { roll, rollIntervals } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class DiceView {
  view: View;
  rolls: { [key: number]: number[] } = {};
  diceBtnsEl: HTMLElement;
  diceResultsEls: { [key: number]: HTMLElement } = [];

  constructor(view: View) {
    this.view = view;
  }

  create() {
    this.diceResultsEls = {};
    this.diceBtnsEl = this.view.tabViewEl.createDiv("dice-buttons");
    this.diceBtnsEl.empty();

    if (this.view.isMobile) {
      this.createResetBtn();
    }

    this.createDiceBtn(4);
    this.createDiceBtn(6);
    this.createDiceBtn(8);
    this.createDiceBtn(10);
    this.createDiceBtn(12);
    this.createDiceBtn(20);

    if (!this.view.isMobile) {
      this.createResetBtn();
    }

    this.repopulateResults();
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
      value = roll(max, value);
      this.rolls[max][rollIndex] = value;
      el.setText(value.toString());
      i++;
      if (rollIntervals[i]) {
        setTimeout(reroll, rollIntervals[i]);
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  addImmediateResult(container: HTMLElement, value: number) {
    const el = container.createDiv("dice-result-value");
    el.setText(value.toString());
  }

  createResetBtn() {
    const container = this.diceBtnsEl.createDiv(
      `dice-variant dice-variant-reset`,
    );

    new ExtraButtonComponent(container)
      .setIcon("refresh-ccw")
      .setTooltip("Reset")
      .onClick(() => {
        for (const el of Object.values(this.diceResultsEls)) {
          el.empty();
        }
        this.rolls = {};
      });
  }

  createDiceBtn(d: number) {
    const container = this.diceBtnsEl.createDiv(
      `dice-variant dice-variant-${d}`,
    );

    const resultsEl = container.createDiv(`dice-results dice-results-${d}`);
    this.diceResultsEls[d] = resultsEl;

    new ButtonComponent(container)
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
        this.addImmediateResult(this.diceResultsEls[key], value);
      }
    }
  }
}

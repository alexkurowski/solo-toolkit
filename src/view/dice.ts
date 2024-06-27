import { ExtraButtonComponent, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { clickToCopy, roll, rollIntervals } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class DiceView {
  view: View;
  rolls: { [key: number]: [number, number][] } = {};
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

  addResult(container: HTMLElement, max: number, color: number) {
    let value = roll(max);

    this.rolls[max] = this.rolls[max] || [];
    const rollIndex = this.rolls[max].length;
    this.rolls[max][rollIndex] = [value, color];

    const el = container.createDiv(`dice-result-value dice-color-${color}`);
    el.setText(value.toString());

    let i = 0;
    const reroll = () => {
      if (this.rolls[max][rollIndex]) {
        value = roll(max, value);
        this.rolls[max][rollIndex][0] = value;
        el.setText(value.toString());
        i++;
        if (rollIntervals[i]) {
          setTimeout(reroll, rollIntervals[i]);
        } else {
          const size = this.rolls[max].length;
          const sum = this.rolls[max].reduce(
            (result, value) => result + (value[0] || 0),
            0
          );
          el.onclick = (event) => {
            const { shiftKey, ctrlKey, metaKey, altKey } = event;
            const anyKey = shiftKey || ctrlKey || metaKey || altKey;
            if (anyKey) {
              clickToCopy(`[${size}d${max}: ${sum}]`)(event);
            } else {
              clickToCopy(`[d${max}: ${value}]`)(event);
            }
          };
          setTooltip(container, `Total: ${sum}`);
        }
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  addImmediateResult(container: HTMLElement, value: number, color: number) {
    const el = container.createDiv(`dice-result-value dice-color-${color}`);
    el.setText(value.toString());
  }

  createDiceBtn(d: number) {
    const container = this.btnsEl.createDiv(`dice-variant dice-variant-${d}`);

    const resultsEl = container.createDiv(`dice-results dice-results-${d}`);
    this.resultEls[d] = resultsEl;

    const btnEl = new ExtraButtonComponent(container)
      .setIcon(`srt-d${d}`)
      .setTooltip(`Roll d${d}`);

    btnEl.extraSettingsEl.onclick = (event) => {
      const { shiftKey, ctrlKey, metaKey, altKey } = event;
      const a = shiftKey ? 0b001 : 0;
      const b = ctrlKey || metaKey ? 0b010 : 0;
      const c = altKey ? 0b100 : 0;
      this.addResult(resultsEl, d, a + b + c);
    };
  }

  repopulateResults() {
    for (const key in this.rolls) {
      while (this.rolls[key].length > MAX_REMEMBER_SIZE) {
        this.rolls[key].shift();
      }

      for (const value of this.rolls[key]) {
        this.addImmediateResult(this.resultEls[key], value[0], value[1]);
      }
    }
  }
}

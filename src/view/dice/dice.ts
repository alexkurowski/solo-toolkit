import { ExtraButtonComponent, setTooltip } from "obsidian";
import {
  random,
  rollIntervals,
  bounce,
  clickToCopy,
  first,
  sum,
} from "../../utils";
import { RollColor } from "./types";
import { DiceView } from "./view";

export class Dice {
  min: number = 1;
  max: number = 20;
  el: HTMLElement;
  resultsEl: HTMLElement;

  constructor(private view: DiceView, private type: string) {
    switch (type) {
      case "d4":
        this.max = 4;
        break;
      case "d6":
        this.max = 6;
        break;
      case "d8":
        this.max = 8;
        break;
      case "d10":
        this.max = 10;
        break;
      case "d12":
        this.max = 12;
        break;
      case "d20":
        this.max = 20;
        break;
      case "d100":
        this.max = 100;
        break;
      case "dF":
        this.min = -1;
        this.max = 1;
        break;
    }

    this.generateDOM();
  }

  format(value: number): string {
    if (this.type === "dF") {
      if (value === -1) return "-";
      if (value === +1) return "+";
      return "▢";
    } else {
      return value.toString();
    }
  }

  addResult(color: RollColor) {
    let value = random(this.min, this.max);

    this.view.rolls[this.type] = this.view.rolls[this.type] || [];
    const rollIndex = this.view.rolls[this.type].length;
    this.view.rolls[this.type][rollIndex] = [value, color];

    const valueEl = this.resultsEl.createDiv(
      `dice-result-value dice-color-${color}`
    );
    valueEl.setText(this.format(value));

    let i = 0;
    const reroll = () => {
      if (this.view.rolls[this.type][rollIndex]) {
        value = random(this.min, this.max, value);
        this.view.rolls[this.type][rollIndex][0] = value;
        valueEl.setText(this.format(value));
        if (this.type === "dF") {
          if (value) {
            valueEl.classList.remove("dice-fudge-0");
          } else {
            valueEl.classList.add("dice-fudge-0");
          }
        }

        i++;
        if (rollIntervals[i]) {
          setTimeout(reroll, rollIntervals[i]);
        } else {
          // To prevent double-tap bug on mobile
          const preventClick = bounce(1000, true);

          valueEl.onclick = (event) => {
            if (preventClick.check()) return;
            const { shiftKey, ctrlKey, metaKey, altKey } = event;
            const anyKey = shiftKey || ctrlKey || metaKey || altKey;

            const [single, total] = this.view.formatForClipboard(
              value,
              this.type
            );

            if (anyKey) {
              clickToCopy(total)(event);
              if (this.view.view.settings.diceDeleteOnCopy) {
                this.resultsEl.empty();
                delete this.view.rolls[this.type];
                this.updateTooltip(this.type);
              }
            } else {
              clickToCopy(single)(event);
              if (this.view.view.settings.diceDeleteOnCopy) {
                valueEl.remove();
                this.view.rolls[this.type][rollIndex][0] = NaN;
                this.updateTooltip(this.type);
              }
            }
          };

          valueEl.oncontextmenu = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const [_single, total] = this.view.formatForClipboard(
              value,
              this.type
            );
            clickToCopy(total)(event);
            if (this.view.view.settings.diceDeleteOnCopy) {
              this.resultsEl.empty();
              delete this.view.rolls[this.type];
              this.updateTooltip(this.type);
            }
            preventClick.set();
          };

          this.updateTooltip(this.type);
        }
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  private updateTooltip(dice: string) {
    const rolls = this.view.getRolls(dice);
    const total = sum(rolls.map(first));

    let text = "";
    if (rolls.length === 1) {
      text = `${dice}: ${total}`;
    } else if (rolls.length > 1) {
      text = `${rolls.length}${dice}: ${total}`;
    }

    setTooltip(this.resultsEl, text, {
      delay: 0,
      placement: "bottom",
    });
  }

  private generateDOM() {
    this.el = this.view.btnsEl.createDiv(
      `dice-variant dice-variant-${this.type}`
    );

    this.resultsEl = this.el.createDiv(
      `dice-results dice-results-${this.type}`
    );
    this.view.resultEls[this.type] = this.resultsEl;

    const btnEl = new ExtraButtonComponent(this.el)
      .setIcon(`srt-${this.type}`)
      .setTooltip(`Roll ${this.type}`);

    // To prevent double-tap bug on mobile
    const preventClick = bounce(1000, true);

    btnEl.extraSettingsEl.onclick = (event) => {
      if (preventClick.check()) return;
      const { shiftKey, ctrlKey, metaKey, altKey } = event;
      const a = shiftKey ? 0b001 : 0;
      const b = ctrlKey || metaKey ? 0b010 : 0;
      const c = altKey ? 0b100 : 0;
      this.addResult(a + b + c);
    };

    btnEl.extraSettingsEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.addResult(1);
      preventClick.set();
    };
  }
}

import { ExtraButtonComponent, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { clickToCopy, roll, rollIntervals, bounce, sum, first } from "../utils";

type RollValue = number;
type RollColor = number;
type Roll = [RollValue, RollColor];

const MAX_REMEMBER_SIZE = 100;

export class DiceView {
  view: View;
  rolls: { [key: number]: Roll[] } = {};
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

  addResult(container: HTMLElement, max: number, color: RollColor) {
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
          // To prevent double-tap bug on mobile
          const preventClick = bounce(1000, true);

          el.onclick = (event) => {
            if (preventClick.check()) return;
            const { shiftKey, ctrlKey, metaKey, altKey } = event;
            const anyKey = shiftKey || ctrlKey || metaKey || altKey;

            const [single, total] = this.formatForClipboard(value, max);

            if (anyKey) {
              clickToCopy(total)(event);
              if (this.view.settings.diceDeleteOnCopy) {
                container.empty();
                delete this.rolls[max];
                this.updateTooltip(container, max);
              }
            } else {
              clickToCopy(single)(event);
              if (this.view.settings.diceDeleteOnCopy) {
                el.remove();
                this.rolls[max][rollIndex][0] = 0;
                this.updateTooltip(container, max);
              }
            }
          };

          el.oncontextmenu = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const [_single, total] = this.formatForClipboard(value, max);
            clickToCopy(total)(event);
            if (this.view.settings.diceDeleteOnCopy) {
              container.empty();
              delete this.rolls[max];
              this.updateTooltip(container, max);
            }
            preventClick.set();
          };

          this.updateTooltip(container, max);
        }
      }
    };
    setTimeout(reroll, rollIntervals[i]);
  }

  addImmediateResult(
    container: HTMLElement,
    value: RollValue,
    color: RollColor
  ) {
    if (!value) return;
    const el = container.createDiv(`dice-result-value dice-color-${color}`);
    el.setText(value.toString());
  }

  private getRolls(dice: number): Roll[] {
    return this.rolls[dice]?.filter((roll) => first(roll) !== 0) || [];
  }

  private updateTooltip(container: HTMLElement, max: number) {
    const rolls = this.getRolls(max);
    const total = sum(rolls.map(first));

    let text = "";
    if (rolls.length === 1) {
      text = `d${max}: ${total}`;
    } else if (rolls.length > 1) {
      text = `${rolls.length}d${max}: ${total}`;
    }

    setTooltip(container, text, {
      delay: 0,
      placement: "bottom",
    });
  }

  formatForClipboard(value: number, max: number): [string, string] {
    const rolls = this.getRolls(max);
    const size = rolls.length;
    const total = sum(rolls.map(first));
    const singleStr = `d${max}: ${value}`;
    const totalStr = `${size}d${max}: ${total}`;
    const inlineSingleStr = `d${max} = ${value}`;
    const inlineTotalStr = `${size > 1 ? size : ""}d${max} = ${total}`;
    switch (this.view.settings.diceClipboardMode) {
      case "plain":
        return [singleStr, totalStr];
      case "parenthesis":
        return [`(${singleStr})`, `(${totalStr})`];
      case "square":
        return [`[${singleStr}]`, `[${totalStr}]`];
      case "curly":
        return [`{${singleStr}}`, `{${totalStr}}`];
      case "code":
        return [`\`${singleStr}\``, `\`${totalStr}\``];
      case "code+parenthesis":
        return [`\`(${singleStr})\``, `\`(${totalStr})\``];
      case "code+square":
        return [`\`[${singleStr}]\``, `\`[${totalStr}]\``];
      case "code+curly":
        return [`\`{${singleStr}}\``, `\`{${totalStr}}\``];
      case "inline":
        return [`\`${inlineSingleStr}\``, `\`${inlineTotalStr}\``];
      case "inline-small":
        return [`\`${inlineSingleStr}\``, `\`${inlineTotalStr}\``];
      case "inline-large":
        return [`\`${inlineSingleStr}\``, `\`${inlineTotalStr}\``];
      default:
        return [singleStr, totalStr];
    }
  }

  createDiceBtn(d: number) {
    const container = this.btnsEl.createDiv(`dice-variant dice-variant-${d}`);

    const resultsEl = container.createDiv(`dice-results dice-results-${d}`);
    this.resultEls[d] = resultsEl;

    const btnEl = new ExtraButtonComponent(container)
      .setIcon(`srt-d${d}`)
      .setTooltip(`Roll d${d}`);

    // To prevent double-tap bug on mobile
    const preventClick = bounce(1000, true);

    btnEl.extraSettingsEl.onclick = (event) => {
      if (preventClick.check()) return;
      const { shiftKey, ctrlKey, metaKey, altKey } = event;
      const a = shiftKey ? 0b001 : 0;
      const b = ctrlKey || metaKey ? 0b010 : 0;
      const c = altKey ? 0b100 : 0;
      this.addResult(resultsEl, d, a + b + c);
    };

    btnEl.extraSettingsEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.addResult(resultsEl, d, 1);
      preventClick.set();
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

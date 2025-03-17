import { SoloToolkitView as View } from "../index";
import { sum, first } from "../../utils";
import { Dice } from "./dice";
import { Roll } from "./types";

export class DiceView {
  view: View;
  dice: Record<string, Dice> = {};
  rolls: Record<string, Roll[]> = {};
  btnsEl: HTMLElement;
  resultEls: { [key: string]: HTMLElement } = {};

  constructor(view: View) {
    this.view = view;
  }

  create() {
    this.rolls = {};

    this.resultEls = {};
    this.btnsEl = this.view.tabViewEl.createDiv("dice-buttons");
    this.btnsEl.empty();

    this.dice = {
      d4: new Dice(this, "d4"),
      d6: new Dice(this, "d6"),
      d8: new Dice(this, "d8"),
      d10: new Dice(this, "d10"),
      d12: new Dice(this, "d12"),
      d20: new Dice(this, "d20"),
      d100: new Dice(this, "d100"),
      dF: new Dice(this, "dF"),
    };
  }

  reset() {
    for (const el of Object.values(this.resultEls)) {
      el.empty();
    }
    this.rolls = {};
  }

  getRolls(dice: string): Roll[] {
    return this.rolls[dice]?.filter((roll) => !Number.isNaN(first(roll))) || [];
  }

  formatForClipboard(value: number, dice: string): [string, string] {
    const rolls = this.getRolls(dice);
    const size = rolls.length;
    const total = sum(rolls.map(first));
    const singleStr = `${dice}: ${value}`;
    const totalStr = `${size}${dice}: ${total}`;
    const inlineSingleStr = `${dice} = ${value}`;
    const inlineTotalStr = `${size > 1 ? size : ""}${dice} = ${total}`;
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
}

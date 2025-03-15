import { setIcon } from "obsidian";
import { BaseWidget, DomOptions } from "./types";

export const COUNT_LIMIT_REGEX = /^`[+-]?\d+\/[+-]?\d+`$/;
export const COUNT_LIMIT_REGEX_G = /`[+-]?\d+\/[+-]?\d+`/g;

export class CountLimitWidgetBase implements BaseWidget {
  value: number;
  max: number;

  el: HTMLElement;
  minusEl: HTMLElement;
  valueEl: HTMLElement;
  plusEl: HTMLElement;

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.value > this.max) this.value = this.max;
  }

  private parseValue(text: string) {
    const split = text.replace(/`/g, "").split("/");
    this.value = parseInt(split[0]) || 0;
    this.max = parseInt(split[1]) || 0;
  }

  private addValue(add: number) {
    this.value += add;
    if (this.value > this.max) this.value = this.max;
    this.valueEl.innerText = `${this.value} / ${this.max}`;
  }

  getText(wrap = ""): string {
    return `${wrap}${this.value}/${this.max}${wrap}`;
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-count");

    this.minusEl = this.el.createEl("button");
    this.minusEl.classList.add("clickable-icon");
    setIcon(this.minusEl, "minus");

    this.valueEl = this.el.createEl("span");
    this.valueEl.innerText = `${this.value} / ${this.max}`;

    this.plusEl = this.el.createEl("button");
    this.plusEl.classList.add("clickable-icon");
    setIcon(this.plusEl, "plus");

    this.valueEl.onclick = () => {
      onFocus?.();
    };

    this.minusEl.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        this.addValue(-10);
      } else {
        this.addValue(-1);
      }
      onChange?.();
    };
    this.minusEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.addValue(-10);
      onChange?.();
    };

    this.plusEl.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        this.addValue(10);
      } else {
        this.addValue(1);
      }
      onChange?.();
    };
    this.plusEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.addValue(10);
      onChange?.();
    };
  }
}

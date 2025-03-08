import { setIcon } from "obsidian";
import { BaseWidget, DomOptions } from "./types";

export const COUNT_REGEX = /^`[+-]?\d+`$/;
export const COUNT_REGEX_G = /`[+-]?\d+`/g;

export class CountWidgetBase implements BaseWidget {
  value: number;

  el: HTMLElement;
  minusEl: HTMLElement;
  valueEl: HTMLElement;
  plusEl: HTMLElement;

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);
  }

  private parseValue(text: string) {
    this.value = parseInt(text.replace(/`/g, "")) || 0;
  }

  private addValue(add: number) {
    this.value += add;
    this.valueEl.innerText = this.value.toString();
  }

  getText(wrap = ""): string {
    return `${wrap}${this.value.toString()}${wrap}`;
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-count");

    this.minusEl = this.el.createEl("button");
    this.minusEl.classList.add("clickable-icon");
    setIcon(this.minusEl, "minus");

    this.valueEl = this.el.createEl("span");
    this.valueEl.innerText = this.value.toString();

    this.plusEl = this.el.createEl("button");
    this.plusEl.classList.add("clickable-icon");
    setIcon(this.plusEl, "plus");

    this.valueEl.onclick = () => {
      onFocus?.();
    };

    this.minusEl.onclick = (event) => {
      if (event.shiftKey) {
        this.addValue(-10);
      } else {
        this.addValue(-1);
      }
      onChange?.();
    };
    this.minusEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.addValue(-10);
      onChange?.();
    };

    this.plusEl.onclick = (event) => {
      if (event.shiftKey) {
        this.addValue(10);
      } else {
        this.addValue(1);
      }
      onChange?.();
    };
    this.plusEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.addValue(10);
      onChange?.();
    };
  }
}

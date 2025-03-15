import { setIcon } from "obsidian";
import { createMenu } from "./shared";
import { BaseWidget, DomOptions } from "./types";

export const COUNT_LIMIT_REGEX = /^`[+-]?\d+\/[+-]?\d+`$/;
export const COUNT_LIMIT_REGEX_G = /`[+-]?\d+\/[+-]?\d+`/g;

const NUMBERS = Array.from({ length: 10 }, (_, i: number) => i + 1);

export class CountLimitWidgetBase implements BaseWidget {
  prefix: string = "";
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

  private setValue(newValue: number) {
    this.value = newValue;
    if (this.value > this.max) this.value = this.max;
    this.valueEl.innerText = `${this.value} / ${this.max}`;
  }

  private addMax(add: number) {
    this.max += add;
    if (this.value > this.max) this.value = this.max;
    this.valueEl.innerText = `${this.value} / ${this.max}`;
  }

  getText(wrap = ""): string {
    return `${wrap}${this.prefix}${this.value}/${this.max}${wrap}`;
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

    const menu = createMenu([
      {
        title: "Add value",
        subMenu: NUMBERS.map((add: number) => ({
          title: `+${add}`,
          onClick: () => {
            this.addValue(add);
            onChange?.();
          },
        })),
      },
      {
        title: "Subtract value",
        subMenu: NUMBERS.map((add: number) => ({
          title: `-${add}`,
          onClick: () => {
            this.addValue(-add);
            onChange?.();
          },
        })),
      },
      {
        title: "Add max",
        subMenu: NUMBERS.map((add: number) => ({
          title: `+${add}`,
          onClick: () => {
            this.addMax(add);
            onChange?.();
          },
        })),
      },
      {
        title: "Subtract max",
        subMenu: NUMBERS.map((add: number) => ({
          title: `-${add}`,
          onClick: () => {
            this.addMax(-add);
            onChange?.();
          },
        })),
      },
      "-",
      {
        title: "Reset",
        onClick: () => {
          this.setValue(this.max);
          onChange?.();
        },
      },
      {
        title: "Drain",
        onClick: () => {
          this.setValue(0);
          onChange?.();
        },
      },
      "-",
      {
        title: "Make clock",
        onClick: () => {
          this.prefix = "clock: ";
          onChange?.();
        },
      },
      {
        title: "Make boxes",
        onClick: () => {
          this.prefix = "boxes: ";
          onChange?.();
        },
      },
      onFocus ? "-" : undefined,
      onFocus
        ? {
            title: "Edit",
            onClick: () => {
              onFocus();
            },
          }
        : undefined,
    ]);

    this.valueEl.onclick = () => {
      onFocus?.();
    };
    this.valueEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.showAtMouseEvent(event);
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
      if (event.shiftKey) {
        this.addMax(-10);
      } else {
        this.addMax(-1);
      }
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
      if (event.shiftKey) {
        this.addMax(-10);
      } else {
        this.addMax(-1);
      }
      onChange?.();
    };
  }
}

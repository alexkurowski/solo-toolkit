import { setTooltip } from "obsidian";
import { BaseWidget, DomOptions } from "./types";

export const TRACK_REGEX = /^`[+-]?\d+\/\d+`$/;
export const TRACK_REGEX_G = /`[+-]?\d+\/\d+`/g;
export const EXPLICIT_TRACK_REGEX = /^`(s|l)?(b:|boxes:) ?[+-]?\d+\/\d+`$/;
export const EXPLICIT_TRACK_REGEX_G = /`(s|l)?(b:|boxes:) ?[+-]?\d+\/\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 200;

export class TrackWidgetBase implements BaseWidget {
  prefix: string;
  value: number;
  max: number;
  size: number;

  el: HTMLElement;
  btnEls: HTMLElement[];

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;

    if (this.prefix.startsWith("s")) {
      this.size = 16;
    } else if (this.prefix.startsWith("l")) {
      this.size = 38;
    } else {
      this.size = 22;
    }
  }

  private parseValue(text: string) {
    this.prefix = "";
    this.value = 0;
    this.max = 0;

    const split = text.replace(/`/g, "").split("/");
    if (split[0].includes(":")) {
      const match = split[0].match(/\d/);
      if (match) {
        this.prefix = split[0].substring(0, match.index);
        split[0] = split[0].replace(this.prefix, "");
      }
    }

    this.value = parseInt(split[0]) || 0;
    this.max = parseInt(split[1]) || 0;
  }

  getText(wrap = ""): string {
    return `${wrap}${this.prefix}${this.value}/${this.max}${wrap}`;
  }

  private setValue(newValue: number) {
    if (this.value > newValue + 1) {
      this.value = newValue + 1;
    } else if (this.value === newValue + 1) {
      this.value = newValue;
    } else {
      this.value = newValue + 1;
    }
    this.updateButtonClasses();
  }

  private updateButtonClasses() {
    for (const i in this.btnEls) {
      const btnEl = this.btnEls[i];
      if (parseInt(i) < this.value) {
        btnEl.classList.add("active");
      } else {
        btnEl.classList.remove("active");
      }
    }
  }

  generateDOM({ onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-track");

    this.btnEls = [];
    for (let i = 0; i < this.max; i++) {
      const btnEl = this.el.createEl("button");
      btnEl.style.width = `${this.size}px`;
      btnEl.style.height = `${this.size}px`;
      btnEl.classList.add("clickable-icon", "srt-track-btn");
      btnEl.onclick = (event) => {
        event.preventDefault();
        this.setValue(i);
        onChange?.();
      };
      setTooltip(btnEl, (i + 1).toString(), { delay: 0 });
      this.btnEls.push(btnEl);
    }

    this.updateButtonClasses();
  }
}

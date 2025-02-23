import { App, setTooltip, TFile } from "obsidian";
import { replaceInFile } from "src/utils/plugin";

export const TRACK_REGEX = /^`[+-]?\d+\/\d+`$/;
export const EXPLICIT_TRACK_REGEX = /^`(b:|boxes:) ?[+-]?\d+\/\d+`$/;
const TRACK_REGEX_G = /`[+-]?\d+\/\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 200;

export class TrackWidget {
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;
  prefix: string;
  value: number;
  max: number;
  btnEls: HTMLElement[];

  constructor(opts: {
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;
    originalText: string;
  }) {
    this.app = opts.app;
    this.file = opts.file;
    this.lineStart = opts.lineStart;
    this.lineEnd = opts.lineEnd;
    this.index = opts.index;
    [this.prefix, this.value, this.max] = this.parseValue(opts.originalText);

    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
  }

  parseValue(text: string): [string, number, number] {
    let prefix = "";
    let value = 0;
    let max = 0;
    const split = text.replace(/`/g, "").split("/");
    if (split[0].includes(":")) {
      const match = split[0].match(/\d/);
      if (match) {
        prefix = split[0].substring(0, match.index);
        split[0] = split[0].replace(prefix, "");
      }
    }
    value = parseInt(split[0]) || 0;
    max = parseInt(split[1]) || 0;
    return [prefix, value, max];
  }

  updateButtonClasses() {
    for (const i in this.btnEls) {
      const btnEl = this.btnEls[i];
      if (parseInt(i) < this.value) {
        btnEl.classList.add("active");
      } else {
        btnEl.classList.remove("active");
      }
    }
  }

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: TRACK_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: `\`${this.prefix}${this.value}/${this.max}\``,
      replaceIndex: this.index,
    });
  }

  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-track");

    this.btnEls = [];
    for (let i = 0; i < this.max; i++) {
      const btnEl = document.createElement("button");
      btnEl.classList.add("clickable-icon", "srt-track-btn");
      setTooltip(btnEl, (i + 1).toString());
      btnEl.onclick = (event) => {
        event.preventDefault();
        if (this.value >= i + 1) {
          this.value = i;
        } else {
          this.value = i + 1;
        }
        this.updateButtonClasses();
        this.updateDoc();
      };
      this.btnEls.push(btnEl);
      el.append(btnEl);
    }

    this.updateButtonClasses();

    return el;
  }
}

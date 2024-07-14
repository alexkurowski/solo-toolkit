import { TFile, App, setIcon } from "obsidian";
import { replaceInFile } from "src/utils/plugin";

export const COUNT_REGEX = /^`[+-]?\d+`$/;
const COUNT_REGEX_G = /`[+-]?\d+`/g;

export class CountWidget {
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;
  value: number;

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
    this.value = this.parseValue(opts.originalText);
  }

  parseValue(text: string): number {
    return parseInt(text.replace(/`/g, "")) || 0;
  }

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: COUNT_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: `\`${this.value}\``,
      replaceIndex: this.index,
    });
  }

  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-count");

    const valueEl = document.createElement("span");
    valueEl.innerText = this.value.toString();

    const minusEl = document.createElement("button");
    minusEl.classList.add("clickable-icon");
    setIcon(minusEl, "minus");
    minusEl.onclick = (event) => {
      if (event.shiftKey) {
        this.value -= 10;
      } else {
        this.value -= 1;
      }
      valueEl.innerText = this.value.toString();
      this.updateDoc();
    };
    minusEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.value -= 10;
      valueEl.innerText = this.value.toString();
      this.updateDoc();
    };

    const plusEl = document.createElement("button");
    plusEl.classList.add("clickable-icon");
    setIcon(plusEl, "plus");
    plusEl.onclick = (event) => {
      if (event.shiftKey) {
        this.value += 10;
      } else {
        this.value += 1;
      }
      valueEl.innerText = this.value.toString();
      this.updateDoc();
    };
    plusEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.value += 10;
      valueEl.innerText = this.value.toString();
      this.updateDoc();
    };

    el.append(minusEl);
    el.append(valueEl);
    el.append(plusEl);

    return el;
  }
}

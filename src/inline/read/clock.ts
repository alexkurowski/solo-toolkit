import { TFile, App } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import {
  ClockWidgetBase,
  CLOCK_REGEX,
  CLOCK_REGEX_G,
  EXPLICIT_CLOCK_REGEX,
  EXPLICIT_CLOCK_REGEX_G,
} from "../base";

export { CLOCK_REGEX, EXPLICIT_CLOCK_REGEX };

export class ClockWidget {
  base: ClockWidgetBase;
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;

  constructor(opts: {
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;
    originalText: string;
    defaultSize: string;
  }) {
    this.base = new ClockWidgetBase(opts);

    this.app = opts.app;
    this.file = opts.file;
    this.lineStart = opts.lineStart;
    this.lineEnd = opts.lineEnd;
    this.index = opts.index;
  }

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: this.base.prefix ? EXPLICIT_CLOCK_REGEX_G : CLOCK_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: this.base.getText("`"),
      replaceIndex: this.index,
    });
  }

  toDOM(): HTMLElement {
    this.base.generateDOM({
      onChange: () => this.updateDoc(),
    });

    return this.base.el;
  }
}

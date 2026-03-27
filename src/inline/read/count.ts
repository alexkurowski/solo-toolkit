import { TFile, App } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import {
  CountWidgetBase,
  COUNT_REGEX,
  COUNT_REGEX_G,
  getWidgetLines,
} from "../base";

export { COUNT_REGEX };

export class CountWidget {
  base: CountWidgetBase;
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
  }) {
    this.base = new CountWidgetBase(opts);

    this.app = opts.app;
    this.file = opts.file;
    this.lineStart = opts.lineStart;
    this.lineEnd = opts.lineEnd;
    this.index = opts.index;
  }

  updateDoc(event: MouseEvent) {
    const [lineStart, lineEnd] = getWidgetLines(this, event);

    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: COUNT_REGEX_G,
      lineStart,
      lineEnd,
      newValue: this.base.getText("`"),
      replaceIndex: this.index,
    });
  }

  toDOM(): HTMLElement {
    this.base.generateDOM({
      onChange: (event: MouseEvent) => this.updateDoc(event),
    });

    return this.base.el;
  }
}

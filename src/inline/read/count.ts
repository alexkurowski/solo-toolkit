import { TFile, App } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import { CountWidgetBase, COUNT_REGEX, COUNT_REGEX_G } from "../base";
import { findParentWidgetLines } from "../base/shared";

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

  updateDoc(event: any) {
    let lineStart = this.lineStart;
    let lineEnd = this.lineEnd;

    if ((lineStart === -1 || lineEnd === -1) && event) {
      [lineStart, lineEnd] = findParentWidgetLines({
        app: this.app,
        event,
      });
    }

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
      onChange: (event) => this.updateDoc(event),
    });

    return this.base.el;
  }
}

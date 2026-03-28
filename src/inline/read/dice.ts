import { TFile, App } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import {
  DiceWidgetBase,
  DICE_REGEX,
  DICE_REGEX_G,
  getWidgetLines,
} from "../base";

export { DICE_REGEX };

export class DiceWidget {
  base: DiceWidgetBase;
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
    this.base = new DiceWidgetBase(opts);

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
      regex: DICE_REGEX_G,
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

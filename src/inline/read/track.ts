import { App, TFile } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import {
  TrackWidgetBase,
  TRACK_REGEX,
  TRACK_REGEX_G,
  getWidgetLines,
} from "../base";

export { TRACK_REGEX };

export class TrackWidget {
  base: TrackWidgetBase;
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
    highlight: boolean;
  }) {
    this.base = new TrackWidgetBase(opts);

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
      regex: TRACK_REGEX_G,
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

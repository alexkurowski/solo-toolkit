import { App, TFile } from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import { TrackWidgetBase, TRACK_REGEX, TRACK_REGEX_G } from "../base";

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
  }) {
    this.base = new TrackWidgetBase(opts);

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
      regex: TRACK_REGEX_G,
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

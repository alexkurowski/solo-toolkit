import {
  TFile,
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  Editor,
} from "obsidian";
import { replaceInFile } from "src/utils/plugin";
import { CountWidgetBase, COUNT_REGEX, COUNT_REGEX_G } from "../base";
import { MaybeWithPosAtMouse } from "./types";

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

    // FIXME: read plugin in edit mode don't provide section info, so this is the only somewhat working workaround I could find
    if ((lineStart === -1 || lineEnd === -1) && event) {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) {
        const editor = view.editor as Editor & MaybeWithPosAtMouse;
        if (editor?.posAtMouse) {
          const position = editor.posAtMouse(event);
          if (position) {
            lineStart = position.line;
            lineEnd = lineStart + 100; // Dunno how many lines the parent element is, we'll hope for the best here
          }
          editor.setSelection(position);
        }
      }
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

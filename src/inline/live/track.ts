import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { TrackWidgetBase, TRACK_REGEX } from "../base";
import { focusOnNode } from "./shared";

export { TRACK_REGEX };

export class TrackWidget extends WidgetType {
  base: TrackWidgetBase;
  node: SyntaxNode;

  constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
    super();

    this.base = new TrackWidgetBase(opts);
    this.node = opts.originalNode;
  }

  updateDoc(view: EditorView) {
    view.dispatch({
      changes: [
        {
          from: this.node.from,
          to: this.node.to,
          insert: this.base.getText(),
        },
      ],
    });
  }

  toDOM(view: EditorView): HTMLElement {
    this.base.generateDOM({
      onFocus: () => {
        focusOnNode(view, this.node);
      },
      onChange: () => this.updateDoc(view),
    });

    return this.base.el;
  }
}

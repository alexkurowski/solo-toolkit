import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { TrackWidgetBase, TRACK_REGEX, EXPLICIT_TRACK_REGEX } from "../base";

export { TRACK_REGEX, EXPLICIT_TRACK_REGEX };

export class TrackWidget extends WidgetType {
  base: TrackWidgetBase;
  node: SyntaxNode;

  constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
    super();

    this.base = new TrackWidgetBase(opts);
    this.node = opts.originalNode;
  }

  focusOnNode(view: EditorView) {
    const pos = this.node.to;
    view.dispatch({
      selection: { anchor: pos, head: pos },
    });
    // FIXME: for some reason this.node.to results in: `1/10`|
    //        while this.node.to - 1 results in: `1/1|0`
    //        thus a timeout fix :(
    setTimeout(() => {
      view.dispatch({
        selection: { anchor: pos, head: pos },
      });
    }, 33);
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
      onChange: () => this.updateDoc(view),
    });

    return this.base.el;
  }
}

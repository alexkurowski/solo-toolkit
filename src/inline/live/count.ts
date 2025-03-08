import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { CountWidgetBase } from "../base";

export const COUNT_REGEX = /^`[+-]?\d+`$/;

export class CountWidget extends WidgetType {
  base: CountWidgetBase;
  node: SyntaxNode;
  dirty: () => void;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    dirty: () => void;
  }) {
    super();

    this.base = new CountWidgetBase(opts);
    this.node = opts.originalNode;

    this.dirty = opts.dirty;
  }

  focusOnNode(view: EditorView) {
    const pos = this.node.to;
    view.dispatch({
      selection: { anchor: pos, head: pos },
    });
    // FIXME: for some reason this.node.to results in: `1`|
    //        while this.node.to - 1 results in: `|1`
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
      onFocus: () => {
        this.dirty();
        this.focusOnNode(view);
      },
      onChange: () => this.updateDoc(view),
    });

    return this.base.el;
  }
}

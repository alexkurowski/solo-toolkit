import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { ClockWidgetBase, CLOCK_REGEX } from "../base";
import { focusOnNode } from "./shared";

export { CLOCK_REGEX };

export class ClockWidget extends WidgetType {
  base: ClockWidgetBase;
  node: SyntaxNode;

  constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
    super();

    this.base = new ClockWidgetBase(opts);
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

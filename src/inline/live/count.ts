import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { CountWidgetBase } from "../base";
import { focusOnNode } from "./shared";

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
        focusOnNode(view, this.node);
      },
      onChange: () => this.updateDoc(view),
    });

    return this.base.el;
  }
}

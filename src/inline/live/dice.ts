import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { DICE_REGEX, DiceWidgetBase } from "../base";
import { focusOnNode } from "./shared";

export { DICE_REGEX };

export class DiceWidget extends WidgetType {
  base: DiceWidgetBase;
  node: SyntaxNode;

  constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
    super();

    this.base = new DiceWidgetBase(opts);
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

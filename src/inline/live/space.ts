import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { SpaceWidgetBase, SPACE_REGEX } from "../base";
import { focusOnNode } from "./shared";

export { SPACE_REGEX };

export class SpaceWidget extends WidgetType {
  base: SpaceWidgetBase;
  node: SyntaxNode;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
  }) {
    super();

    this.base = new SpaceWidgetBase(opts);
    this.node = opts.originalNode;
  }

  toDOM(view: EditorView): HTMLElement {
    this.base.generateDOM({
      onFocus: () => {
        focusOnNode(view, this.node);
      },
    });

    return this.base.el;
  }
}

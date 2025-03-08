import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { SpaceWidgetBase, SPACE_REGEX } from "../base";

export { SPACE_REGEX };

export class SpaceWidget extends WidgetType {
  base: SpaceWidgetBase;
  node: SyntaxNode;
  dirty: () => void;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
    dirty: () => void;
  }) {
    super();

    this.base = new SpaceWidgetBase(opts);
    this.node = opts.originalNode;

    this.dirty = opts.dirty;
  }

  focusOnNode(view: EditorView) {
    const pos = this.node.to;
    view.dispatch({
      selection: { anchor: pos, head: pos },
    });
    // FIXME: for some reason this.node.to results in: ` `|
    //        while this.node.to - 1 results in: `| `
    //        thus a timeout fix :(
    setTimeout(() => {
      view.dispatch({
        selection: { anchor: pos, head: pos },
      });
    }, 33);
  }

  toDOM(view: EditorView): HTMLElement {
    this.base.generateDOM({
      onFocus: () => {
        this.dirty();
        this.focusOnNode(view);
      },
    });

    return this.base.el;
  }
}

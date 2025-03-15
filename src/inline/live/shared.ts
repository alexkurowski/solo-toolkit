import { SyntaxNode } from "@lezer/common";
import { EditorView } from "@codemirror/view";

export const focusOnNode = (view: EditorView, node: SyntaxNode) => {
  const pos = node.to;
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
};

import { setIcon } from "obsidian";
import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";

export const COUNT_REGEX = /^`[+-]?\d+`$/;

export class CountWidget extends WidgetType {
  node: SyntaxNode;
  value: number;
  dirty: () => void;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    dirty: () => void;
  }) {
    super();
    this.node = opts.originalNode;
    this.value = this.parseValue(opts.originalText);
    this.dirty = opts.dirty;
  }

  parseValue(text: string): number {
    return parseInt(text.replace(/`/g, "")) || 0;
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
          insert: `${this.value}`,
        },
      ],
    });
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-count");

    const valueEl = document.createElement("span");
    valueEl.innerText = this.value.toString();
    valueEl.onclick = () => {
      this.dirty();
      this.focusOnNode(view);
    };

    const minusEl = document.createElement("button");
    minusEl.classList.add("clickable-icon");
    setIcon(minusEl, "minus");
    minusEl.onclick = () => {
      this.value--;
      valueEl.innerText = this.value.toString();
      this.updateDoc(view);
    };

    const plusEl = document.createElement("button");
    plusEl.classList.add("clickable-icon");
    setIcon(plusEl, "plus");
    plusEl.onclick = () => {
      this.value++;
      valueEl.innerText = this.value.toString();
      this.updateDoc(view);
      return false;
    };

    el.append(minusEl);
    el.append(valueEl);
    el.append(plusEl);

    return el;
  }
}

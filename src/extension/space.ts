import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";

export const SPACE_REGEX = /^` +`$/;
const RETRY_COUNT = 20;
const RETRY_DELAY = 2;
const TAB_SIZE = 30;

export class SpaceWidget extends WidgetType {
  node: SyntaxNode;
  size: number;
  width: number = 0;
  updateInitialWidth: (width: number) => void;
  dirty: () => void;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
    dirty: () => void;
  }) {
    super();
    this.node = opts.originalNode;
    this.size = opts.originalText.length - 2;
    this.width = opts.initialWidth;
    this.updateInitialWidth = opts.updateInitialWidth;
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

  setWidth(el: HTMLElement, width: number) {
    this.width = width;
    this.updateInitialWidth(width);
    el.style.width = `${width}px`;
    el.style.minWidth = `2px`;
  }

  updateWidth(el: HTMLElement, triesLeft: number) {
    if (triesLeft < 0) {
      this.setWidth(el, 50);
      return;
    }

    if (triesLeft === RETRY_COUNT) {
      const left = el.offsetLeft;
      if (left === 0) {
        this.updateWidth(el, triesLeft - 1);
        return;
      } else {
        let width = TAB_SIZE - (left % TAB_SIZE);
        for (let i = 1; i < this.size; i++) width += TAB_SIZE;
        this.setWidth(el, width);
      }
    } else {
      setTimeout(() => {
        const left = el.offsetLeft;
        if (left === 0) {
          this.updateWidth(el, triesLeft - 1);
          return;
        } else {
          let width = TAB_SIZE - (left % TAB_SIZE);
          for (let i = 1; i < this.size; i++) width += TAB_SIZE;
          this.setWidth(el, width);
        }
      }, RETRY_DELAY);
    }
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-space");

    el.onclick = () => {
      this.dirty();
      this.focusOnNode(view);
    };

    if (this.width) {
      el.style.width = `${this.width}px`;
      el.style.minWidth = `2px`;
    }

    this.updateWidth(el, RETRY_COUNT);

    return el;
  }
}

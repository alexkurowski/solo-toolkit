import { setIcon } from "obsidian";
import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";

export const TRACK_REGEX = /^`[+-]?\d+\/\d+`$/;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 200;

export class TrackWidget extends WidgetType {
  node: SyntaxNode;
  value: number;
  max: number;
  dirty: () => void;
  btnEls: HTMLElement[];

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    dirty: () => void;
  }) {
    super();
    this.node = opts.originalNode;
    [this.value, this.max] = this.parseValue(opts.originalText);
    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    this.dirty = opts.dirty;
  }

  parseValue(text: string): [number, number] {
    const split = text.replace(/`/g, "").split("/");
    return [parseInt(split[0]) || 0, parseInt(split[1]) || 0];
  }

  updateButtonClasses() {
    for (const i in this.btnEls) {
      const btnEl = this.btnEls[i];
      if (parseInt(i) < this.value) {
        btnEl.classList.add("active");
      } else {
        btnEl.classList.remove("active");
      }
    }
  }

  focusOnNode(view: EditorView) {
    const pos =
      this.node.from +
      this.value.toString().length +
      1 +
      this.max.toString().length;
    view.dispatch({
      selection: { anchor: pos, head: pos },
    });
  }

  updateDoc(view: EditorView) {
    view.dispatch({
      changes: [
        {
          from: this.node.from,
          to: this.node.to,
          insert: `${this.value}/${this.max}`,
        },
      ],
    });
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-track");

    this.btnEls = [];
    for (let i = 0; i < this.max; i++) {
      const btnEl = document.createElement("button");
      btnEl.classList.add("clickable-icon", "srt-track-btn");
      btnEl.onclick = () => {
        if (this.value === i + 1) {
          this.value = i;
        } else {
          this.value = i + 1;
        }
        this.updateButtonClasses();
        this.updateDoc(view);
      };
      this.btnEls.push(btnEl);
      el.append(btnEl);
    }

    this.updateButtonClasses();

    const editEl = document.createElement("div");
    editEl.classList.add("clickable-icon", "srt-track-edit");
    setIcon(editEl, "pen");
    editEl.onclick = () => {
      this.dirty();
      this.focusOnNode(view);
    };

    el.append(editEl);

    return el;
  }
}

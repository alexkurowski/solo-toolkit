import { setIcon, setTooltip } from "obsidian";
import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";

export const TRACK_REGEX = /^`[+-]?\d+\/\d+`$/;
export const EXPLICIT_TRACK_REGEX = /^`(b:|boxes:) ?[+-]?\d+\/\d+`$/;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 200;

export class TrackWidget extends WidgetType {
  node: SyntaxNode;
  prefix: string;
  value: number;
  max: number;
  dirty: () => void;
  showEdit: boolean;
  btnEls: HTMLElement[];

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    dirty: () => void;
    showEdit: boolean;
  }) {
    super();
    this.node = opts.originalNode;
    [this.prefix, this.value, this.max] = this.parseValue(opts.originalText);
    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    this.dirty = opts.dirty;
    this.showEdit = opts.showEdit;
  }

  parseValue(text: string): [string, number, number] {
    let prefix = "";
    let value = 0;
    let max = 0;
    const split = text.replace(/`/g, "").split("/");
    if (split[0].includes(":")) {
      const match = split[0].match(/\d/);
      if (match) {
        prefix = split[0].substring(0, match.index);
        split[0] = split[0].replace(prefix, "");
      }
    }
    value = parseInt(split[0]) || 0;
    max = parseInt(split[1]) || 0;
    return [prefix, value, max];
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
    const pos = this.node.to;
    view.dispatch({
      selection: { anchor: pos, head: pos },
    });
    // FIXME: for some reason this.node.to results in: `1/10`|
    //        while this.node.to - 1 results in: `1/1|0`
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
          insert: `${this.prefix}${this.value}/${this.max}`,
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
      setTooltip(btnEl, (i + 1).toString());
      btnEl.onclick = (event) => {
        event.preventDefault();
        if (this.value >= i + 1) {
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

    if (this.showEdit) {
      const editEl = el.createEl("div");
      editEl.classList.add("clickable-icon", "srt-track-edit");
      setIcon(editEl, "pen");
      editEl.onclick = () => {
        this.dirty();
        this.focusOnNode(view);
      };
    }

    return el;
  }
}

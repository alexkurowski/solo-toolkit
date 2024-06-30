import { setIcon, setTooltip } from "obsidian";
import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";

export const CLOCK_REGEX = /^`[+-]?\d+\/\d+`$/;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 16;
const RAD = Math.PI / 180;

export class ClockWidget extends WidgetType {
  node: SyntaxNode;
  value: number;
  max: number;
  size: number;
  dirty: () => void;
  showEdit: boolean;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    size: string;
    dirty: () => void;
    showEdit: boolean;
  }) {
    super();
    this.node = opts.originalNode;
    [this.value, this.max] = this.parseValue(opts.originalText);
    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    switch (opts.size) {
      case "small_clock":
        this.size = 40;
        break;
      case "big_clock":
        this.size = 80;
        break;
      default:
        this.size = 50;
    }
    this.dirty = opts.dirty;
    this.showEdit = opts.showEdit;
  }

  parseValue(text: string): [number, number] {
    const split = text.replace(/`/g, "").split("/");
    return [parseInt(split[0]) || 0, parseInt(split[1]) || 0];
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
          insert: `${this.value}/${this.max}`,
        },
      ],
    });
  }

  calculatePath(
    centerX: number,
    centerY: number,
    size: number,
    index: number,
    step: number
  ): string {
    const angleA = -index * step + 90;
    const angleB = (-index - 1) * step + 90;
    const x = centerX;
    const y = centerY;
    const cr = size;
    const cx1 = Math.cos(angleB * RAD) * cr + x;
    const cy1 = -Math.sin(angleB * RAD) * cr + y;
    const cx2 = Math.cos(angleA * RAD) * cr + x;
    const cy2 = -Math.sin(angleA * RAD) * cr + y;

    return `M${x} ${y} ${cx1} ${cy1} A${cr} ${cr} 0 0 0 ${cx2} ${cy2}Z`;
  }

  generateSvg(svgEl: SVGElement) {
    svgEl.empty();

    const center = this.size / 2;
    const radius = center - 2;

    if (this.max <= 1) {
      svgEl.createSvg("circle", {
        attr: {
          cx: center,
          cy: center,
          r: radius,
          fill: this.value > 0 ? "currentColor" : "none",
          stroke: "currentColor",
          "stroke-width": 1.25,
        },
      });
    } else {
      const step = 360 / this.max;
      for (let i = 0; i < this.max; i++) {
        svgEl.createSvg("path", {
          attr: {
            d: this.calculatePath(center, center, radius, i, step),
            fill: this.value > i ? "currentColor" : "none",
            stroke: "currentColor",
          },
        });
      }
      svgEl.createSvg("circle", {
        attr: {
          cx: center,
          cy: center,
          r: radius,
          fill: "none",
          stroke: "currentColor",
          "stroke-width": 1.25,
        },
      });
    }
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-clock");
    setTooltip(el, this.value.toString());

    const svgEl = el.createSvg("svg", {
      cls: "srt-clock-svg",
      attr: {
        width: this.size || 50,
        height: this.size || 50,
      },
    });

    this.generateSvg(svgEl);

    svgEl.onclick = (event) => {
      if (!event.shiftKey) {
        this.value = Math.min(Math.max(MIN_VALUE, this.value + 1), this.max);
      } else {
        this.value = Math.min(Math.max(MIN_VALUE, this.value - 1), this.max);
      }
      setTooltip(el, this.value.toString());
      this.generateSvg(svgEl);
      this.updateDoc(view);
    };
    svgEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.value = Math.min(Math.max(MIN_VALUE, this.value - 1), this.max);
      setTooltip(el, this.value.toString());
      this.generateSvg(svgEl);
      this.updateDoc(view);
    };

    if (this.showEdit) {
      const editEl = el.createEl("div");
      editEl.classList.add("clickable-icon", "srt-clock-edit");
      setIcon(editEl, "pen");
      editEl.onclick = () => {
        this.dirty();
        this.focusOnNode(view);
      };
    }

    return el;
  }
}

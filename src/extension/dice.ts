import { setTooltip } from "obsidian";
import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { nroll, rollIntervals } from "src/utils";

export const DICE_REGEX =
  /^`!?(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100)(\|#?[\w\d]+)?( = \d+)?`$/;
let rollLock = false;

export class DiceWidget extends WidgetType {
  node: SyntaxNode;
  disabled: boolean;
  prefix: string;
  quantity: number;
  max: number;
  value: number;
  color: string;
  size: number;
  dirty: () => void;

  constructor(opts: {
    originalNode: SyntaxNode;
    originalText: string;
    dirty: () => void;
  }) {
    super();
    this.node = opts.originalNode;
    this.parseValue(opts.originalText);

    if (this.value < 1) this.value = 1;

    if (this.prefix.startsWith("s")) {
      this.size = 30;
    } else if (this.prefix.startsWith("l")) {
      this.size = 42;
    } else {
      this.size = 36;
    }

    this.dirty = opts.dirty;
  }

  parseValue(text: string) {
    this.disabled = false;
    this.prefix = "";
    this.quantity = 1;
    this.max = 20;
    this.color = "";
    this.value = 20;

    const match = text
      .replace(/`/g, "")
      .match(/(!)?(sm|lg|s|l)?(\d+)?d(\d+)(\|#?[\w\d]+)?( = )?(\d+)?/);

    if (match?.[1]) {
      this.disabled = true;
    }
    if (match?.[2]) {
      this.prefix = match[2];
    }
    if (match?.[3]) {
      this.quantity = parseInt(match[3]) || 1;
    }
    if (match?.[4]) {
      this.max = parseInt(match[4]) || 20;
    }
    if (match?.[5]) {
      this.color = match[5];
    }
    if (match?.[7]) {
      this.value = parseInt(match[7]) || this.max;
    } else {
      this.value = this.max;
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
          insert: `${this.disabled ? "!" : ""}${this.prefix}${
            this.quantity > 1 ? this.quantity : ""
          }d${this.max}${this.color} = ${this.value}`,
        },
      ],
    });
  }

  generateSvg(svgEl: SVGElement) {
    svgEl.empty();

    const center = this.size / 2;
    const width = center - 3;

    const angles: number[] = [];
    switch (this.max) {
      case 4:
        angles.push(-90, 30, 150);
        break;
      case 6:
        angles.push(-45, 45, 135, 225);
        break;
      case 8:
      case 10:
      case 100:
        angles.push(0, 90, 180, 270);
        break;
      case 12:
        angles.push(-90, -18, 54, 126, 198);
        break;
      case 20:
      default:
        angles.push(-90, -30, 30, 90, 150, 210);
        break;
    }

    const points = angles.map((deg: number, index: number) => {
      let length = width;
      if (this.max === 10) {
        if (index === 1 || index === 3) {
          length = width - 3;
        }
      }
      if (this.max === 100) {
        if (index === 1 || index === 3) {
          length = width - 2;
        }
      }
      const x = center + Math.cos((deg * Math.PI) / 180) * length;
      const y = center + Math.sin((deg * Math.PI) / 180) * length;
      return `${x.toFixed(4)} ${y.toFixed(4)}`;
    });

    const pathEl = svgEl.createSvg("path", {
      attr: {
        d: `M${points.join("L")}Z`,
        "stroke-linejoin": "round",
        "stroke-width": 5,
        stroke: "currentColor",
        fill: "currentColor",
      },
    });

    if (this.color) {
      let cssValue = this.color.replace("|", "");
      if (
        [
          "red",
          "orange",
          "yellow",
          "green",
          "cyan",
          "blue",
          "purple",
          "pink",
        ].includes(cssValue)
      ) {
        cssValue = `var(--color-${cssValue})`;
      }
      pathEl.style.stroke = cssValue;
      pathEl.style.fill = cssValue;
    }
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-dice", `srt-dice-d${this.max}`);
    if (this.disabled) {
      el.classList.add("srt-dice-disabled");
    }
    setTooltip(el, `${this.quantity > 1 ? this.quantity : ""}d${this.max}`);

    const svgEl = el.createSvg("svg", {
      cls: "srt-dice-svg",
      attr: {
        width: this.size || 26,
        height: this.size || 26,
      },
    });

    this.generateSvg(svgEl);

    const valueEl = document.createElement("button");
    valueEl.classList.add("clickable-icon", "srt-dice-btn");
    valueEl.innerText = this.value.toString();

    let i = 0;
    const reroll = () => {
      this.value = nroll(this.quantity, this.max, this.value);
      valueEl.innerText = this.value.toString();

      i++;
      if (rollIntervals[i]) {
        setTimeout(reroll, rollIntervals[i] * 0.5);
      } else {
        i = 0;
        this.updateDoc(view);
        rollLock = false;
      }
    };
    valueEl.onclick = () => {
      if (this.disabled) return;
      if (rollLock) return;
      rollLock = true;
      setTimeout(reroll, rollIntervals[i]);
      setTimeout(() => {
        rollLock = false;
      }, 320);
    };
    valueEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.disabled = !this.disabled;
      if (this.disabled) {
        el.classList.add("srt-dice-disabled");
      } else {
        el.classList.remove("srt-dice-disabled");
      }
      this.updateDoc(view);
    };

    el.append(valueEl);

    return el;
  }
}

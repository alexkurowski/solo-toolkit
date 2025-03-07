import { TFile, App, setTooltip } from "obsidian";
import { nroll, rollIntervals } from "src/utils";
import { replaceInFile } from "src/utils/plugin";

export const DICE_REGEX =
  /^`(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100)(\|#?[\w\d]+)?( = \d+)?`$/;
const DICE_REGEX_G =
  /`(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100)(\|#?[\w\d]+)?( = \d+)?`/g;

export class DiceWidget {
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;
  prefix: string;
  quantity: number;
  max: number;
  value: number;
  color: string;
  size: number = 30;

  constructor(opts: {
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;
    originalText: string;
  }) {
    this.app = opts.app;
    this.file = opts.file;
    this.lineStart = opts.lineStart;
    this.lineEnd = opts.lineEnd;
    this.index = opts.index;
    [this.prefix, this.quantity, this.max, this.color, this.value] =
      this.parseValue(opts.originalText);

    if (this.value < 1) this.value = 1;

    if (this.prefix.startsWith("s")) {
      this.size = 30;
    } else if (this.prefix.startsWith("l")) {
      this.size = 42;
    } else {
      this.size = 36;
    }
  }

  parseValue(text: string): [string, number, number, string, number] {
    let prefix = "";
    let quantity = 1;
    let max = 20;
    let color = "";
    let value = 20;
    const match = text
      .replace(/`/g, "")
      .match(/(sm|lg|s|l)?(\d+)?d(\d+)(\|#?[\w\d]+)?( = )?(\d+)?/);
    if (match?.[1]) {
      prefix = match[1];
    }
    if (match?.[2]) {
      quantity = parseInt(match[2]) || 1;
    }
    if (match?.[3]) {
      max = parseInt(match[3]) || 20;
    }
    if (match?.[4]) {
      color = match[4];
    }
    if (match?.[6]) {
      value = parseInt(match[6]) || max;
    } else {
      value = max;
    }
    return [prefix, quantity, max, color, value];
  }

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: DICE_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: `\`${this.prefix}${this.quantity > 1 ? this.quantity : ""}d${
        this.max
      }${this.color} = ${this.value}\``,
      replaceIndex: this.index,
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
      pathEl.style.stroke = this.color.replace("|", "");
      pathEl.style.fill = this.color.replace("|", "");
    }
  }

  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-dice", `srt-dice-d${this.max}`);
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
        this.updateDoc();
      }
    };
    valueEl.onclick = () => {
      if (i > 0) return;
      setTimeout(reroll, rollIntervals[i]);
    };

    el.append(valueEl);

    return el;
  }
}

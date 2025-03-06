import { TFile, App, setTooltip } from "obsidian";
import { roll, rollIntervals } from "src/utils";
import { replaceInFile } from "src/utils/plugin";

export const DICE_REGEX = /^`d(4|6|8|10|12|20|100)(\|#?[\w\d]+)?( = \d+)?`$/;
const DICE_REGEX_G = /`d(4|6|8|10|12|20|100)(\|#?[\w\d]+)?( = \d+)?`/g;

export class DiceWidget {
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;
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
    [this.max, this.color, this.value] = this.parseValue(opts.originalText);
  }

  parseValue(text: string): [number, string, number] {
    let max = 20;
    let color = "";
    let value = 20;
    const match = text
      .replace(/`/g, "")
      .match(/d(\d+)(\|#?[\w\d]+)?( = )?(\d+)?/);
    if (match?.[1]) {
      max = parseInt(match[1]) || 20;
    }
    if (match?.[2]) {
      color = match[2];
    }
    if (match?.[4]) {
      value = parseInt(match[4]) || max;
    } else {
      value = max;
    }
    return [max, color, value];
  }

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: DICE_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: `\`d${this.max}${this.color} = ${this.value}\``,
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
    setTooltip(el, `d${this.max}`);

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
      this.value = roll(this.max, this.value);
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
      this.value = roll(this.max, this.value);
      setTimeout(reroll, rollIntervals[i]);
    };

    el.append(valueEl);

    return el;
  }
}

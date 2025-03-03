import { TFile, App, setTooltip } from "obsidian";
import { replaceInFile } from "src/utils/plugin";

export const CLOCK_REGEX = /^`[+-]?\d+\/\d+`$/;
export const EXPLICIT_CLOCK_REGEX =
  /^`((s|l)?c:|(sm|lg)?clock:) ?[+-]?\d+\/\d+`$/;
const CLOCK_REGEX_G = /`[+-]?\d+\/\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 16;
const RAD = Math.PI / 180;

export class ClockWidget {
  app: App;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  index: number;
  prefix: string;
  value: number;
  max: number;
  size: number;

  constructor(opts: {
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;
    originalText: string;
    size: string;
  }) {
    this.app = opts.app;
    this.file = opts.file;
    this.lineStart = opts.lineStart;
    this.lineEnd = opts.lineEnd;
    this.index = opts.index;
    [this.prefix, this.value, this.max] = this.parseValue(opts.originalText);

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

  updateDoc() {
    replaceInFile({
      vault: this.app.vault,
      file: this.file,
      regex: this.prefix ? EXPLICIT_CLOCK_REGEX : CLOCK_REGEX_G,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      newValue: `\`${this.prefix}${this.value}/${this.max}\``,
      replaceIndex: this.index,
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

  toDOM(): HTMLElement {
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
      this.updateDoc();
    };
    svgEl.oncontextmenu = (event) => {
      event.preventDefault();
      this.value = Math.min(Math.max(MIN_VALUE, this.value - 1), this.max);
      setTooltip(el, this.value.toString());
      this.generateSvg(svgEl);
      this.updateDoc();
    };

    return el;
  }
}

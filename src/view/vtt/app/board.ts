import { Dnd } from "./dnd";
import { VttApp } from "./main";
import { Vec2 } from "./types";
import { generateString, newVec2 } from "./utils";

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
const SCALE_FACTOR = 0.0075;

export class Board {
  dnd: Dnd;
  position: Vec2 = newVec2(0, 0);
  scale: number = 1;
  private mousePosition: Vec2 = newVec2();
  zoom: number = 1;
  el: HTMLElement;
  bg: SVGElement;
  parentRect: DOMRect;
  dbg: HTMLElement;

  constructor(private parent: VttApp) {
    this.dnd = this.parent.dnd;

    const bgParentId = generateString();
    const bgParent = this.parent.el.createSvg("svg", "canvas-background");
    this.bg = bgParent.createSvg("pattern", {
      attr: {
        id: bgParentId,
        patternUnits: "userSpaceOnUse",
      },
    });
    this.bg.createSvg("circle", {
      attr: {
        cx: 0.7,
        cy: 0.7,
        r: 0.7,
      },
    });
    bgParent.createSvg("rect", {
      attr: {
        x: 0,
        y: 0,
        width: "100%",
        height: "100%",
        fill: `url(#${bgParentId})`,
      },
    });

    this.el = this.parent.el.createDiv("srt-vtt-board");
    this.parentRect = this.parent.el.getBoundingClientRect();
    // this.dbg = this.el.createDiv("srt-vtt-debug");
    this.updateTransform();

    this.el.parentElement?.addEventListener("wheel", this.onScroll.bind(this));
    this.el.parentElement?.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    new ResizeObserver(() => {
      this.parentRect = this.parent.el.getBoundingClientRect();
      this.updateTransform();
    }).observe(this.parent.el);
  }

  //
  // Element updates
  //
  updateTransform() {
    if (this.bg.parentElement) {
      const center = this.getCenter();

      this.el.style.transform = `translate(${center.x}px, ${center.y}px) scale(${this.scale}) translate(${this.position.x}px, ${this.position.y}px)`;

      let bgSize = 20 * this.scale;
      if (bgSize < 10) bgSize += 10;
      this.bg.setAttrs({
        x: center.x + (this.position.x % (bgSize * this.scale)),
        y: center.y + (this.position.y % (bgSize * this.scale)),
        width: bgSize,
        height: bgSize,
      });
    }
  }

  //
  // Event handlers
  //
  onScroll(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      const prevScale = this.scale;
      this.scale -= event.deltaY * SCALE_FACTOR;
      if (this.scale > MAX_SCALE) this.scale = MAX_SCALE;
      if (this.scale < MIN_SCALE) this.scale = MIN_SCALE;

      const scaledBy = prevScale / this.scale;
      const targetX = -this.mousePosition.x;
      const targetY = -this.mousePosition.y;

      this.position.x = targetX - (targetX - this.position.x) * scaledBy;
      this.position.y = targetY - (targetY - this.position.y) * scaledBy;

      this.updateTransform();
      this.dnd.scale = this.scale;
    } else {
      this.position.x -= event.deltaX * (1 / this.scale);
      this.position.y -= event.deltaY * (1 / this.scale);
      this.updateTransform();
    }
  }

  onMouseMove(event: MouseEvent) {
    const center = this.getCenter();
    const offsetX = event.clientX - this.parentRect.left;
    const offsetY = event.clientY - this.parentRect.top;
    this.mousePosition.x = (offsetX - center.x) / this.scale - this.position.x;
    this.mousePosition.y = (offsetY - center.y) / this.scale - this.position.y;

    if (this.dbg) {
      this.dbg.style.transform = `translate(${this.mousePosition.x - 10}px, ${
        this.mousePosition.y - 10
      }px)`;
    }
  }

  private getCenter(): Vec2 {
    return {
      x: (this.bg.parentElement?.clientWidth || 0) / 2,
      y: (this.bg.parentElement?.clientHeight || 0) / 2,
    };
  }

  //
  // Board actions
  //
  getMousePosition(): Vec2 {
    return {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
    };
  }
}

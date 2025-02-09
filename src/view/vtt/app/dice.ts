import { Menu, MenuItem, setTooltip } from "obsidian";
import { DiceId, Parent, Vec2 } from "./types";
import { newVec2, SNAP, DICE_SIZE, snap, moveToTop } from "./utils";
import { roll } from "../../../utils";
import { VttApp } from "./main";

export class Dice {
  id: DiceId;
  position: Vec2 = newVec2();
  rotation: number = 0;
  value: number = 0;
  private frameDuration: number = 100;
  private frameCount: number = 8;
  el: HTMLElement;
  rollEl: HTMLElement;
  valueEl: HTMLElement;
  menu: Menu;

  constructor(
    private parent: Parent,
    private ctx: VttApp,
    public d: number,
    params?: Partial<Dice>
  ) {
    if (params) Object.assign(this, params);

    // Create element
    this.el = this.parent.el.createDiv("srt-vtt-dice");
    this.el.style.width = `${DICE_SIZE}px`;
    this.el.style.height = `${DICE_SIZE}px`;
    setTooltip(this.el, `d${this.d}`);
    this.rollEl = this.el.createDiv("srt-vtt-dice-roll");
    {
      // SVG background
      const angles: number[] = [];
      const svg = this.rollEl.createSvg("svg", {
        attr: {
          class: "srt-vtt-dice-bg",
          x: 0,
          y: 0,
          width: DICE_SIZE,
          height: DICE_SIZE,
        },
      });
      switch (this.d) {
        case 4:
          angles.push(-90, 30, 150);
          break;
        case 6:
          angles.push(-45, 45, 135, 225);
          break;
        case 8:
        case 10:
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
      const center = DICE_SIZE / 2;
      const size = center - 6;
      const points = angles.map((deg: number, index: number) => {
        let l = size;
        if (this.d === 10) {
          if (index === 1 || index === 3) {
            l = DICE_SIZE / 3;
          }
        }
        const x = center + Math.cos((deg * Math.PI) / 180) * l;
        const y = center + Math.sin((deg * Math.PI) / 180) * l;
        return `${x.toFixed(4)} ${y.toFixed(4)}`;
      });
      svg.createSvg("path", {
        attr: {
          d: `M${points.join("L")}Z`,
          "stroke-linejoin": "round",
          "stroke-width": 10,
          stroke: "#444",
          fill: "#444",
        },
      });
      svg.createSvg("path", {
        attr: {
          d: `M${points.join("L")}Z`,
          "stroke-linejoin": "round",
          "stroke-width": 4,
          stroke: "#fff",
          fill: "#fff",
        },
      });
    }
    this.valueEl = this.rollEl.createDiv("srt-vtt-dice-fg");
    this.valueEl.setText(this.d.toString());

    this.updateTransform();
    setTimeout(() => {
      this.roll();
    });

    // Make draggable
    this.parent.dnd.makeDraggable(this);

    // Create context menu
    this.menu = new Menu();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Roll").onClick(() => {
        this.roll();
      })
    );
    this.menu.addSeparator();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Remove").onClick(() => {
        this.ctx.removeDice(this);
      })
    );
    this.el.oncontextmenu = (event: MouseEvent) => {
      event.stopPropagation();
      this.menu.showAtMouseEvent(event);
    };
  }

  //
  // Element updates
  //
  updateSelected(isSelected: boolean) {
    if (isSelected) {
      this.el.classList.add("srt-vtt-dice-selected");
    } else {
      this.el.classList.remove("srt-vtt-dice-selected");
    }
  }

  updateTransform() {
    let x = this.position.x;
    let y = this.position.y;
    if (SNAP) {
      x = snap(x);
      y = snap(y);
    }
    this.el.style.transform = `translate(${x}px, ${y}px) rotate(${this.rotation}deg)`;
  }

  updateValue() {
    this.valueEl.setText(this.value.toString());
  }

  //
  // Event handlers
  //
  onClick() {
    this.roll();
    moveToTop(this.el);
  }

  onLongClick() {
    this.parent.dnd.toggleSelect(this);
  }

  onDrop() {
    if (SNAP) {
      this.snapToGrid();
    }
  }

  //
  // Dice actions
  //
  roll() {
    this.el.style.pointerEvents = "none";
    this.rollEl.style.animation = "0.8s 1 ease-in-out srt-vtt-roll";

    let frameCounter = 1;
    const nextFrame = () => {
      if (frameCounter < this.frameCount) {
        this.value = roll(this.d, this.value);
        this.updateValue();
        setTimeout(() => {
          nextFrame();
        }, this.frameDuration);
      } else {
        this.rotation = 0;
        this.el.style.pointerEvents = "";
        this.rollEl.style.animation = "";
      }
      frameCounter++;
    };

    nextFrame();
  }

  private snapToGrid() {
    this.position.x = snap(this.position.x);
    this.position.y = snap(this.position.y);
  }
}

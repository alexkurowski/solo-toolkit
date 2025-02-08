import { Draggable, DraggableOptions, Vec2 } from "./types";
import { newVec2 } from "./utils";

const DRAG_START_DISTANCE = 4;
const CLICK_TIME_DELTA = 600;
const LONG_CLICK_TIME_DELTA = 800;

export class Dnd {
  scale = 1;

  private draggables: Set<Draggable> = new Set();

  private currentDraggable: Draggable | null = null;
  private longPressTimeout: ReturnType<typeof setTimeout> | null = null;

  private dragStartPosition: Vec2 = newVec2();
  private dragStartAt: number = 0;
  private isDragging: boolean = false;

  private mouseMoveHandler: (event: MouseEvent) => void;
  private mouseUpHandler: (event: MouseEvent) => void;

  constructor() {
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
  }

  cleanup() {
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.removeEventListener("mouseup", this.mouseUpHandler);
  }

  makeDraggable(draggable: Draggable, options?: DraggableOptions) {
    const handleMouseDown = (event: MouseEvent) => {
      if (!options?.propagateClick) {
        event.stopPropagation();
      }

      if (
        (options?.rightBtn && event.button !== 2) ||
        (!options?.rightBtn && event.button !== 0)
      ) {
        return;
      }

      this.currentDraggable = draggable;
      if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
      this.longPressTimeout = setTimeout(() => {
        this.longPressTimeout = null;
        this.handleLongPress.bind(this)(event);
      }, LONG_CLICK_TIME_DELTA);

      this.isDragging = false;
      this.dragStartPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.dragStartAt = Date.now();
    };

    draggable.el.addEventListener("mousedown", handleMouseDown);
  }

  handleMouseMove(event: MouseEvent) {
    if (event.buttons & 1) {
      if (this.isDragging) {
        this.forEachDraggable((draggable) => {
          const moveBy = {
            x: event.movementX * (1 / this.scale),
            y: event.movementY * (1 / this.scale),
          };
          draggable.position = {
            x: draggable.position.x + moveBy.x,
            y: draggable.position.y + moveBy.y,
          };
          draggable.updateTransform();

          if (draggable.onMove) {
            draggable.onMove();
          }
        });
      } else {
        const distance = Math.sqrt(
          (event.clientX - this.dragStartPosition.x) ** 2 +
            (event.clientY - this.dragStartPosition.y) ** 2
        );
        if (distance >= DRAG_START_DISTANCE) {
          this.isDragging = true;

          if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
          }

          if (this.currentDraggable) {
            this.draggables.add(this.currentDraggable);
          }
          this.forEachDraggable((draggable) => {
            if (draggable.onDrag) {
              draggable.onDrag();
            }
            this.moveToTop(draggable.el);
          });
        }
      }
    }
  }

  handleMouseUp(event: MouseEvent) {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    if (this.isDragging) {
      this.forEachDraggable((draggable) => {
        if (draggable.onDrop) {
          draggable.onDrop();
        }
        draggable.updateSelected(false);
      });
      this.draggables.clear();
      this.isDragging = false;
    } else {
      if (this.currentDraggable) {
        if (Date.now() - this.dragStartAt <= CLICK_TIME_DELTA) {
          if (this.currentDraggable.onClick) {
            this.currentDraggable.onClick(event);
          }
        }
      } else {
        this.forEachDraggable((draggable) => {
          draggable.updateSelected(false);
        });
        this.draggables.clear();
      }
    }

    this.currentDraggable = null;
  }

  handleLongPress(event: MouseEvent) {
    if (this.currentDraggable && this.currentDraggable.onLongClick) {
      this.currentDraggable.onLongClick(event);
    }
  }

  toggleSelect(draggable: Draggable, force?: boolean) {
    const willSelect = force ?? !this.draggables.has(draggable);
    if (willSelect) {
      this.draggables.add(draggable);
      draggable.updateSelected(true);
    } else {
      this.draggables.delete(draggable);
      draggable.updateSelected(false);
    }
  }

  moveToTop(el: HTMLElement) {
    el.parentElement?.appendChild(el);
  }

  private forEachDraggable(callback: (draggable: Draggable) => void) {
    Array.from(this.draggables)
      .sort((a: Draggable, b: Draggable) => {
        return (
          Array.prototype.indexOf.call(a.el.parentElement?.children, a.el) -
          Array.prototype.indexOf.call(b.el.parentElement?.children, b.el)
        );
      })
      .forEach(callback);
  }
}

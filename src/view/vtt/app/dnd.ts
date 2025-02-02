import { Draggable, DragOptions, Vec2 } from "./types";
import { identity, newVec2 } from "./utils";

const DRAG_START_DISTANCE = 4;
const CLICK_TIME_DELTA = 600;

export class Dnd {
  private dragging: Draggable | null = null;
  private dragOptions: DragOptions | null = null;

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

  makeDraggable(draggable: Draggable, options?: DragOptions) {
    const handleMouseDown = (event: MouseEvent) => {
      event.stopPropagation();

      if (
        (options?.rightBtn && event.button !== 2) ||
        (!options?.rightBtn && event.button !== 0)
      ) {
        return;
      }

      this.dragging = draggable;
      this.dragOptions = options || null;
      this.isDragging = false;
      this.dragStartPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.dragStartAt = Date.now();

      if (options?.onDrag) {
        options.onDrag();
      }
    };

    const el = options?.startDragOnParent
      ? draggable.el.parentElement
      : draggable.el;
    if (el) {
      el.addEventListener("mousedown", handleMouseDown);
    }
  }

  handleMouseMove(event: MouseEvent) {
    if (this.dragging) {
      if (this.isDragging) {
        const mov = (this.dragOptions?.modifyMovement || identity)({
          x: event.movementX,
          y: event.movementY,
        });
        this.dragging.position = (this.dragOptions?.modifyPosition || identity)(
          {
            x: this.dragging.position.x + mov.x,
            y: this.dragging.position.y + mov.y,
          }
        );
        this.dragging.el.style.transform = (
          this.dragOptions?.modifyTransform || identity
        )(
          `translate(${this.dragging.position.x}px, ${this.dragging.position.y}px)`
        );

        if (this.dragOptions?.onMove) {
          this.dragOptions.onMove();
        }
      } else {
        const distance = Math.sqrt(
          (event.clientX - this.dragStartPosition.x) ** 2 +
            (event.clientY - this.dragStartPosition.y) ** 2
        );
        if (distance >= DRAG_START_DISTANCE) {
          this.isDragging = true;
          this.moveToTop(this.dragging.el);
        }
      }
    }
  }

  handleMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      if (this.dragOptions?.onDrop) {
        this.dragOptions.onDrop();
      }
    } else {
      if (Date.now() - this.dragStartAt <= CLICK_TIME_DELTA) {
        if (this.dragOptions?.onClick) {
          this.dragOptions.onClick(event);
        }
      }
    }

    this.dragging = null;
    this.dragOptions = null;
    this.isDragging = false;
  }

  moveToTop(el: HTMLElement) {
    el.parentElement?.appendChild(el);
  }
}

import { MAP_WIDTH, MAP_HEIGHT } from "./shared";
import { random } from "../dice";

interface Map {
  at(x: number, y: number): number;
}

const TILE_WIDTH = 48;
const TILE_HEIGHT = 48;
const LINE_WALL = 3;
const LINE_FLOOR = 0.25;
const LINE_JAG = 2;

const drawTile = (opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
}) => {
  const { ctx, x, y } = opts;

  ctx.fillStyle = "#ffffffee";
  ctx.fillRect(x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
};

const drawHorizontalLine = (opts: {
  ctx: CanvasRenderingContext2D;
  x1: number;
  x2: number;
  y: number;
  width: number;
}) => {
  if (opts.x1 === opts.x2) return;

  const ctx = opts.ctx;

  const x1 = (opts.x1 < opts.x2 ? opts.x1 : opts.x2) * TILE_WIDTH;
  const x2 = (opts.x1 < opts.x2 ? opts.x2 : opts.x1) * TILE_WIDTH;
  const y = opts.y * TILE_HEIGHT;

  ctx.lineWidth = opts.width;
  ctx.beginPath();
  ctx.moveTo(x1, y);

  const step = TILE_WIDTH;
  const hstep = step / 2;

  for (let i = x1; i < x2; i += step) {
    ctx.quadraticCurveTo(
      i + hstep,
      y + random(-LINE_JAG, LINE_JAG),
      i + step,
      y
    );
  }

  ctx.stroke();
};

const drawVerticalLine = (opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y1: number;
  y2: number;
  width: number;
}) => {
  if (opts.y1 === opts.y2) return;

  const ctx = opts.ctx;

  const x = opts.x * TILE_WIDTH;
  const y1 = (opts.y1 < opts.y2 ? opts.y1 : opts.y2) * TILE_HEIGHT;
  const y2 = (opts.y1 < opts.y2 ? opts.y2 : opts.y1) * TILE_HEIGHT;

  ctx.lineWidth = opts.width;
  ctx.beginPath();
  ctx.moveTo(x, y1);

  const step = TILE_HEIGHT;
  const hstep = step / 2;

  for (let i = y1; i < y2; i += step) {
    ctx.quadraticCurveTo(
      x + random(-LINE_JAG, LINE_JAG),
      i + hstep,
      x,
      i + step
    );
  }

  ctx.stroke();
};

export const drawMap = (ctx: CanvasRenderingContext2D, map: Map) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      if (map.at(x, y) === 1) {
        drawTile({
          ctx,
          x,
          y,
        });
      }
    }
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      if (map.at(x, y) === 1) {
        // Left wall
        if (map.at(x - 1, y) === 0) {
          drawVerticalLine({
            ctx,
            x: x,
            y1: y,
            y2: y + 1,
            width: LINE_WALL,
          });
        }
        // Right wall & floor
        if (map.at(x + 1, y) === 0) {
          drawVerticalLine({
            ctx,
            x: x + 1,
            y1: y,
            y2: y + 1,
            width: LINE_WALL,
          });
        } else {
          drawVerticalLine({
            ctx,
            x: x + 1,
            y1: y,
            y2: y + 1,
            width: LINE_FLOOR,
          });
        }
        // Up wall
        if (map.at(x, y - 1) === 0) {
          drawHorizontalLine({
            ctx,
            x1: x,
            x2: x + 1,
            y: y,
            width: LINE_WALL,
          });
        }
        // Down wall & floor
        if (map.at(x, y + 1) === 0) {
          drawHorizontalLine({
            ctx,
            x1: x,
            x2: x + 1,
            y: y + 1,
            width: LINE_WALL,
          });
        } else {
          drawHorizontalLine({
            ctx,
            x1: x,
            x2: x + 1,
            y: y + 1,
            width: LINE_FLOOR,
          });
        }
      }
    }
  }
};

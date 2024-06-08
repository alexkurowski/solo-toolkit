import { MapBlueprint } from "./shared";
import { random } from "../dice";

let mapWidth = 0;
let mapHeight = 0;
let tileWidth = 0;
let tileHeight = 0;

const LINE_WALL = 3;
const LINE_FLOOR = 0.25;
const LINE_JAG = 2;

const at = (map: MapBlueprint, x: number, y: number): number => {
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
    return 0;
  } else {
    return map[x][y];
  }
};

const drawFloor = (opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
}) => {
  const { ctx, x, y } = opts;

  ctx.fillStyle = "#ffffffee";
  ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
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

  const x1 = (opts.x1 < opts.x2 ? opts.x1 : opts.x2) * tileWidth;
  const x2 = (opts.x1 < opts.x2 ? opts.x2 : opts.x1) * tileWidth;
  const y = opts.y * tileHeight;

  ctx.lineWidth = opts.width;
  ctx.beginPath();
  ctx.moveTo(x1, y);

  const step = tileWidth;
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

  const x = opts.x * tileWidth;
  const y1 = (opts.y1 < opts.y2 ? opts.y1 : opts.y2) * tileHeight;
  const y2 = (opts.y1 < opts.y2 ? opts.y2 : opts.y1) * tileHeight;

  ctx.lineWidth = opts.width;
  ctx.beginPath();
  ctx.moveTo(x, y1);

  const step = tileHeight;
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

export const drawMap = (ctx: CanvasRenderingContext2D, map: MapBlueprint) => {
  mapWidth = map.length;
  mapHeight = map[0].length;
  tileWidth = Math.floor(ctx.canvas.width / mapWidth);
  tileHeight = Math.floor(ctx.canvas.height / mapHeight);

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      if (at(map, x, y) === 1) {
        drawFloor({
          ctx,
          x,
          y,
        });
      }
    }
  }

  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      if (at(map, x, y) === 1) {
        // Left wall
        if (at(map, x - 1, y) === 0) {
          drawVerticalLine({
            ctx,
            x: x,
            y1: y,
            y2: y + 1,
            width: LINE_WALL,
          });
        }
        // Right wall & floor line
        if (at(map, x + 1, y) === 0) {
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
        if (at(map, x, y - 1) === 0) {
          drawHorizontalLine({
            ctx,
            x1: x,
            x2: x + 1,
            y: y,
            width: LINE_WALL,
          });
        }
        // Down wall & floor line
        if (at(map, x, y + 1) === 0) {
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

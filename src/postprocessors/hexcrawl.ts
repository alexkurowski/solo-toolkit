import { MarkdownPostProcessorContext } from "obsidian";
import { random } from "src/utils";
import { MAP_WIDTH, MAP_HEIGHT, Hex } from "./hexcrawl.shared";
import { parseSource } from "./hexcrawl.source";

const MAP_PADDING = 16;
const TILE_HEIGHT_FACTOR = 0.875;
const FONT_SIZE_COORDS = 16;
const FONT_SIZE_NAME = 18;

export const hexcrawl = (
  source: string,
  el: HTMLElement,
  _ctx: MarkdownPostProcessorContext
) => {
  const { hexes, width, height } = parseSource(source);

  const canvasEl = el.createEl("canvas");
  canvasEl.width = MAP_WIDTH;
  canvasEl.height = MAP_HEIGHT;
  canvasEl.style.width = "100%";
  // canvasEl.onmousemove

  const canvasCtx = canvasEl.getContext("2d");
  if (canvasCtx) drawMap(canvasCtx, hexes, width, height);
};

const drawHex = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  ctx.lineWidth = 3;

  ctx.beginPath();
  drawLine(ctx, x + w / 4, y, x + w / 4 + w / 2, y);
  drawLine(ctx, x + w / 4 + w / 2, y, x + w, y + h / 2);
  drawLine(ctx, x + w, y + h / 2, x + w / 4 + w / 2, y + h);
  drawLine(ctx, x + w / 4 + w / 2, y + h, x + w / 4, y + h);
  drawLine(ctx, x + w / 4, y + h, x, y + h / 2);
  drawLine(ctx, x, y + h / 2, x + w / 4, y);
  ctx.stroke();
  // ctx.moveTo(x + w / 4, y);
  // ctx.lineTo(x + w / 2 + w / 4, y);
  // ctx.lineTo(x + w, y + h / 2);
  // ctx.lineTo(x + w / 2 + w / 4, y + h);
  // ctx.lineTo(x + w / 4, y + h);
  // ctx.lineTo(x, y + h / 2);
  // ctx.lineTo(x + w / 4, y);
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const hx = (x2 - x1) / 2;
  const hy = (y2 - y1) / 2;

  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(
    x1 + hx / 2 + random(-2, 2),
    y1 + hy / 2 + random(-2, 2),
    x1 + hx,
    y1 + hy
  );
  ctx.quadraticCurveTo(
    x1 + hx + hx / 2 + random(-2, 2),
    y1 + hy + hy / 2 + random(-2, 2),
    x2,
    y2
  );
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  return lines;
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = "#000000",
  bcolor: string = "#ffffff"
) => {
  ctx.fillStyle = bcolor;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      ctx.fillText(text, x + i, y + j);
    }
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

const drawMap = (
  ctx: CanvasRenderingContext2D,
  hexes: Hex[],
  width: number,
  height: number
) => {
  const canvasWidth = ctx.canvas.width - MAP_PADDING * 2;
  const canvasHeight = ctx.canvas.height - MAP_PADDING * 2;
  const allTilesWidth = width * 0.75 + 0.25;
  const allTilesHeight = (height + 0.5) * TILE_HEIGHT_FACTOR;
  const maxTileWidth = canvasWidth / allTilesWidth;
  const maxTileHeight = canvasHeight / allTilesHeight;
  const tileWidth = Math.min(maxTileWidth, maxTileHeight);
  const tileWidth2 = tileWidth / 2;
  const tileHeight = tileWidth * TILE_HEIGHT_FACTOR;
  const tileHeight2 = tileHeight / 2;

  const shouldOffsetX = maxTileWidth > maxTileHeight;
  const shouldOffsetY = maxTileWidth < maxTileHeight;
  const offsetX = shouldOffsetX
    ? (canvasWidth - tileWidth * allTilesWidth) / 2
    : 0;
  const offsetY = shouldOffsetY
    ? (canvasHeight - tileHeight * allTilesHeight) / 2
    : 0;

  const getXY = (hex: Hex) => ({
    x: hex.x * tileWidth - (hex.x / 2) * tileWidth2 + MAP_PADDING,
    y: hex.y * tileHeight + (hex.x % 2 == 1 ? tileHeight2 : 0) + MAP_PADDING,
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const hex of hexes) {
    let { x, y } = getXY(hex);
    x += offsetX;
    y += offsetY;

    const fillColor = hex.color || "#fff";
    const name = hex.name || "";

    drawHex(ctx, x, y, tileWidth, tileHeight);

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.fillStyle = "#000000";
    const coor = `${hex.ox}${hex.oy}`;
    ctx.font = `${FONT_SIZE_COORDS}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(coor, x + tileWidth2, y + 4);

    if (name) {
      const lineHeight = FONT_SIZE_NAME + 2;
      const lines = wrapText(ctx, name, tileWidth2);
      ctx.font = `${FONT_SIZE_NAME}px sans-serif`;
      ctx.textBaseline = "bottom";
      for (let i = 0; i < lines.length; i++) {
        drawText(
          ctx,
          lines[i],
          x + tileWidth2,
          y + tileHeight - 4 - (lines.length - i - 1) * lineHeight
        );
      }
    }
  }
};

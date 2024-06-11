import { MarkdownPostProcessorContext } from "obsidian";

type Hex = {
  ox: string;
  oy: string;
  x: number;
  y: number;
  color: string;
  name: string;
  type: string;
};

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 1024;

const knownTypes = [""];

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

  const canvasCtx = canvasEl.getContext("2d");
  if (canvasCtx) drawMap(canvasCtx, hexes, width, height);
};

const parseSource = (
  source: string
): { hexes: Hex[]; width: number; height: number } => {
  let forceWidth = 0;
  let forceHeight = 0;

  const hexes: Hex[] = source
    .split("\n")
    .map((line) => line.trim())
    .map((line): Hex | null => {
      if (line.startsWith("size:")) {
        const size = line.replace("size:", "").trim();
        const [width, height] = size.split(/[x|:]/);
        forceWidth = parseInt(width);
        forceHeight = parseInt(height);
        return null;
      }

      const values = line
        .split(/ (?=(?:[^"]*"[^"]*")*$)/g)
        .map((value) => value.trim())
        .filter((value) => value);

      const posStr = values.shift();
      if (!posStr?.length) return null;
      const posMiddle = Math.floor(posStr.length / 2);
      const ox = posStr.substring(0, posMiddle);
      const oy = posStr.substring(posMiddle);
      const x = parseInt(ox);
      const y = parseInt(oy);
      if (Number.isNaN(x) || Number.isNaN(y)) return null;

      let color = "";
      let name = "";
      let type = "";

      const params = values;
      for (const param of params) {
        if (param.startsWith("#")) {
          color = param;
        } else if (param.startsWith('"') || param.startsWith("'")) {
          name = param.replace(/^["']|["']$/g, "");
        } else if (knownTypes.includes(param)) {
          type = param;
        }
      }

      return { x, y, ox, oy, color, name, type };
    })
    .filter((line) => line) as Hex[];

  if (forceWidth && forceHeight) {
    for (let x = 1; x <= forceWidth; x++) {
      for (let y = 1; y <= forceHeight; y++) {
        if (!hexes.find((hex) => hex.x === x && hex.y === y)) {
          hexes.push({
            ox: x < 10 ? `0${x}` : `${x}`,
            oy: y < 10 ? `0${y}` : `${y}`,
            x,
            y,
            color: "",
            name: "",
            type: "",
          });
        }
      }
    }
  }

  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  for (const hex of hexes) {
    if (hex.x > maxX) maxX = hex.x;
    if (hex.x < minX) minX = hex.x;
    if (hex.y > maxY) maxY = hex.y;
    if (hex.y < minY) minY = hex.y;
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  for (const hex of hexes) {
    hex.x -= minX;
    hex.y -= minY;
  }

  return { hexes, width, height };
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
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

const drawMap = (
  ctx: CanvasRenderingContext2D,
  hexes: Hex[],
  width: number,
  height: number
) => {
  const padding = 32;
  const hfactor = 0.875;
  const canvasWidth = ctx.canvas.width - padding * 2;
  const canvasHeight = ctx.canvas.height - padding * 2;
  const maxTileWidth = canvasWidth / (width * 0.75 + 0.25);
  const maxTileHeight = canvasHeight / ((height + 0.5) * hfactor);
  const tileWidth = Math.min(maxTileWidth, maxTileHeight);
  const tileWidth2 = tileWidth / 2;
  const tileWidth4 = tileWidth / 4;
  const tileHeight = tileWidth * hfactor;
  const tileHeight2 = tileHeight / 2;

  const fontSize = Math.ceil(tileHeight / 10);
  const lineHeight = fontSize + 1;

  const getXY = (hex: Hex) => ({
    x: hex.x * tileWidth - (hex.x / 2) * tileWidth2 + padding,
    y: hex.y * tileHeight + (hex.x % 2 == 1 ? tileHeight2 : 0) + padding,
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const hex of hexes) {
    const { x, y } = getXY(hex);

    let fillColor = hex.color || "#fff";
    let name = hex.name || "";

    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x + tileWidth4, y);
    ctx.lineTo(x + tileWidth2 + tileWidth4, y);
    ctx.lineTo(x + tileWidth, y + tileHeight2);
    ctx.lineTo(x + tileWidth2 + tileWidth4, y + tileHeight);
    ctx.lineTo(x + tileWidth4, y + tileHeight);
    ctx.lineTo(x, y + tileHeight2);
    ctx.lineTo(x + tileWidth4, y);
    ctx.stroke();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.fillStyle = "#000000";
    const coor = `${hex.ox}${hex.oy}`;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(coor, x + tileWidth2, y + 4);

    if (name) {
      const lines = wrapText(ctx, name, tileWidth2);
      ctx.textBaseline = "bottom";
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(
          lines[i],
          x + tileWidth2,
          y + tileHeight - 4 - (lines.length - i - 1) * lineHeight
        );
      }
    }
  }
};

import { Hex } from "./hexcrawl.shared";

const knownTypes = [""];

export const parseSource = (
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

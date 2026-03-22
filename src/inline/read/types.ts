export interface MaybeWithPosAtMouse {
  posAtMouse?: (event: MouseEvent) => { line: number; ch: number };
}

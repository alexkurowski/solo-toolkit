import { TFile } from "obsidian";

export interface Card {
  original: TFile | string;
  image: string;
  flip?: number;
  file?: TFile;
  path?: string;
  url?: string;
}

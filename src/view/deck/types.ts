import { TFile } from "obsidian";

export interface DeckCard {
  face: TFile | string;
  back?: TFile | string;
}

export interface DrawnCard {
  card: DeckCard | null;
  faceImage: string;
  backImage?: string;
  flip?: number;
  file?: TFile;
  path?: string;
  url?: string;
}

export type DrawType = string;

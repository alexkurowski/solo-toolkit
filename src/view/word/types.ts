export interface CustomTable {
  [section: string]: string[];
}

export interface CustomTableTemplate {
  key: string;
  value: string;
  capitalize?: boolean;
  upcase?: boolean;
  repeat?: number;
}

export interface CustomTableCurves {
  [section: string]: number;
}

export type CustomTableMode = "default" | "cutup" | "markov";

export interface CustomTableCategory {
  path: string[];
  tabName: string;
  fileName: string;
  templates: CustomTableTemplate[];
  values: CustomTable;
  curves: CustomTableCurves;
}

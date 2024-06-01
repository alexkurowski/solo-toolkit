import { MarkdownPostProcessorContext, MarkdownView } from "obsidian";
import Plugin from "../main";

export const sheetProcessor =
  (plugin: Plugin) =>
  (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    console.log({ source, el, ctx, plugin });

    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    console.log(view);

    const containerEl = el.createDiv("srt-sheet");
    const keysEl = containerEl.createDiv();
    const valuesEl = containerEl.createDiv();

    const state: Record<string, string> = {};
    source.split("\n").forEach((line) => {
      if (!line?.trim()) return;

      const split = line.split(":");
      const key = split[0].trim();
      const value = split[1].trim();
      state[key] = value;
    });

    for (const key in state) {
      const keyEl = keysEl.createDiv();
      keyEl.setText(key);

      const valueEl = valuesEl.createDiv();
      valueEl.setText(state[key]);
    }

    // console.log({ source, el, ctx });

    // const rows = source.split("\n").filter((row) => row.length > 0);

    // const table = el.createEl("table");
    // const body = table.createEl("tbody");

    // for (let i = 0; i < rows.length; i++) {
    //   const cols = rows[i].split(",");

    //   const row = body.createEl("tr");

    //   for (let j = 0; j < cols.length; j++) {
    //     row.createEl("td", { text: cols[j] });
    //   }
    // }
  };

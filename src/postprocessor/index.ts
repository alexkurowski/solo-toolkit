import { MarkdownPostProcessorContext, TFile } from "obsidian";
import { CountWidget, COUNT_REGEX } from "./count";
import { TrackWidget, TRACK_REGEX, EXPLICIT_TRACK_REGEX } from "./track";
import { ClockWidget, CLOCK_REGEX, EXPLICIT_CLOCK_REGEX } from "./clock";
import { SpaceWidget, SPACE_REGEX } from "./space";
import Plugin from "../main";

// Reading view inline elements
export const soloToolkitPostprocessor = (plugin: Plugin) => {
  const spaceStore: Record<string, number> = {};

  return (element: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!plugin.settings.inlineCounters) return;

    const nodeList = element.findAll("code");
    if (!nodeList.length) return;
    const file = plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile)) return;
    const section = ctx.getSectionInfo(element);
    if (!section) return;

    const lineStart = section.lineStart;
    const lineEnd = section.lineEnd;
    let countMatchIndex = 0;
    let trackMatchIndex = 0;
    let clockMatchIndex = 0;
    let spaceMatchIndex = 0;

    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      const mdText = `\`${node.innerText}\``;

      // `3`
      if (COUNT_REGEX.test(mdText)) {
        const widget = new CountWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: countMatchIndex++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `1/6`
      if (plugin.settings.inlineProgressMode === "track") {
        if (TRACK_REGEX.test(mdText)) {
          const widget = new TrackWidget({
            app: plugin.app,
            file,
            lineStart,
            lineEnd,
            index: trackMatchIndex++,
            originalText: mdText,
          });
          node.replaceWith(widget.toDOM());
        }
      } else {
        if (CLOCK_REGEX.test(mdText)) {
          const widget = new ClockWidget({
            app: plugin.app,
            file,
            lineStart,
            lineEnd,
            index: clockMatchIndex++,
            originalText: mdText,
            size: plugin.settings.inlineProgressMode || "clock",
          });
          node.replaceWith(widget.toDOM());
        }
      }

      // `boxes:1/10`
      if (EXPLICIT_TRACK_REGEX.test(mdText)) {
        const widget = new TrackWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: trackMatchIndex++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `clock:1/6` / `smclock: 1/6`
      if (EXPLICIT_CLOCK_REGEX.test(mdText)) {
        let size = "clock";
        if (mdText.startsWith("`s")) size = "small_clock";
        if (mdText.startsWith("`l")) size = "big_clock";
        const widget = new ClockWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: clockMatchIndex++,
          originalText: mdText,
          size,
        });
        node.replaceWith(widget.toDOM());
      }

      // ` `
      if (SPACE_REGEX.test(mdText)) {
        const thisWidgetIndex = `${
          ctx.sourcePath
        }.${lineStart}.${lineEnd}.${spaceMatchIndex++}`;
        const widget = new SpaceWidget({
          originalText: mdText,
          initialWidth: spaceStore[thisWidgetIndex] || 0,
          updateInitialWidth: (width: number) => {
            spaceStore[thisWidgetIndex] = width;
          },
        });
        node.replaceWith(widget.toDOM());
      }
    }
  };
};

import { MarkdownPostProcessorContext, TFile } from "obsidian";
import { CountWidget, COUNT_REGEX } from "./count";
import { CountLimitWidget, COUNT_LIMIT_REGEX } from "./countlimit";
import { TrackWidget, TRACK_REGEX } from "./track";
import { ClockWidget, CLOCK_REGEX } from "./clock";
import { DiceWidget, DICE_REGEX } from "./dice";
import { SpaceWidget, SPACE_REGEX } from "./space";
import Plugin from "../../main";

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
    const indexMap = {
      count: 0,
      countLimit: 0,
      clock: 0,
      track: 0,
      dice: 0,
      space: 0,
    };

    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      const mdText = `\`${node.innerText}\``;

      // `d20`
      if (DICE_REGEX.test(mdText)) {
        const widget = new DiceWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: indexMap.dice++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `3`
      if (COUNT_REGEX.test(mdText)) {
        const widget = new CountWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: indexMap.count++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `1/6`
      if (COUNT_LIMIT_REGEX.test(mdText)) {
        const widget = new CountLimitWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: indexMap.countLimit++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `boxes:1/10`
      if (TRACK_REGEX.test(mdText)) {
        const widget = new TrackWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: indexMap.track++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // `clock:1/6` / `smclock: 1/6`
      if (CLOCK_REGEX.test(mdText)) {
        const widget = new ClockWidget({
          app: plugin.app,
          file,
          lineStart,
          lineEnd,
          index: indexMap.clock++,
          originalText: mdText,
        });
        node.replaceWith(widget.toDOM());
      }

      // ` `
      if (SPACE_REGEX.test(mdText)) {
        const thisWidgetIndex = `${
          ctx.sourcePath
        }.${lineStart}.${lineEnd}.${indexMap.space++}`;
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

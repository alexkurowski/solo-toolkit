import { syntaxTree } from "@codemirror/language";
import {
  RangeSetBuilder,
  EditorSelection,
  SelectionRange,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  ViewUpdate,
  PluginValue,
  PluginSpec,
  EditorView,
  ViewPlugin,
} from "@codemirror/view";
import { CountWidget, COUNT_REGEX } from "./count";
import { TrackWidget, TRACK_REGEX } from "./track";
import Plugin from "../main";

let pluginRef: Plugin;

class TrackPlugin implements PluginValue {
  decorations: DecorationSet;
  considerNextSelectionChange: boolean = false;
  previousBuildMeta: string[] = [];

  constructor(view: EditorView) {
    this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.buildDecorations(update.view);
    } else if (this.considerNextSelectionChange && update.selectionSet) {
      this.considerNextSelectionChange = false;
      this.buildDecorations(update.view);
    }
  }

  destroy() {}

  buildDecorations(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>();
    const buildMeta: string[] = [];

    if (!pluginRef?.settings?.inlineCounters) {
      this.previousBuildMeta = [];
      this.decorations = builder.finish();
      return;
    }

    const selection = view.state.selection;

    const dirty = () => (this.considerNextSelectionChange = true);

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: (node) => {
          if (node.type.name !== "inline-code") return;

          const from = node.from - 1;
          const to = node.to + 1;

          if (this.isRangeSelected(from, to, selection)) {
            this.considerNextSelectionChange = true;
            return;
          }

          const text = view.state.doc.sliceString(from, to).trim();
          const meta = `${from}:${to}:${text}`;

          if (COUNT_REGEX.test(text)) {
            buildMeta.push(meta);
            builder.add(
              from,
              to,
              Decoration.replace({
                widget: new CountWidget({
                  originalNode: node.node,
                  originalText: text,
                  dirty,
                }),
              }),
            );
          }

          if (TRACK_REGEX.test(text)) {
            buildMeta.push(meta);
            builder.add(
              from,
              to,
              Decoration.replace({
                widget: new TrackWidget({
                  originalNode: node.node,
                  originalText: text,
                  dirty,
                }),
              }),
            );
          }
        },
      });
    }

    if (!this.isChanged(buildMeta)) return;
    this.previousBuildMeta = buildMeta;

    this.decorations = builder.finish();
  }

  isRangeSelected(
    from: number,
    to: number,
    selection: EditorSelection,
  ): boolean {
    return !!selection.ranges.find(
      (range: SelectionRange) => range.from <= to && range.to >= from,
    );
  }

  isChanged(buildMeta: string[]): boolean {
    if (!buildMeta.length) return true;
    if (buildMeta.length !== this.previousBuildMeta.length) return true;
    for (const index in buildMeta) {
      if (buildMeta[index] !== this.previousBuildMeta[index]) return true;
    }
    return false;
  }
}

const pluginSpec: PluginSpec<TrackPlugin> = {
  decorations: (value: TrackPlugin) => value.decorations,
};

export const soloToolkitExtension = (plugin: Plugin) => {
  pluginRef = plugin;
  return ViewPlugin.fromClass(TrackPlugin, pluginSpec);
};

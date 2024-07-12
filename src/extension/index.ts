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
import { editorLivePreviewField } from "obsidian";
import { CountWidget, COUNT_REGEX } from "./count";
import { TrackWidget, TRACK_REGEX } from "./track";
import { ClockWidget, CLOCK_REGEX } from "./clock";
import { SpaceWidget, SPACE_REGEX } from "./space";
import Plugin from "../main";

type BuildMeta = string;

let pluginRef: Plugin;

class TrackPlugin implements PluginValue {
  decorations: DecorationSet;
  considerNextSelectionChange: boolean = false;
  previousBuildMeta: BuildMeta[] = [];
  spaceStore: Record<BuildMeta, number> = {};
  spaceStoreIndex: Record<number, number> = {};

  constructor(view: EditorView) {
    this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    const isLivePreview = update.state.field(editorLivePreviewField);
    const shouldDisable =
      !pluginRef?.settings?.inlineCounters || !isLivePreview;

    if (shouldDisable) {
      return;
    }

    const shouldUpdate = pluginRef?.settings?.inlineDynamicEdit
      ? update.docChanged || update.viewportChanged || update.selectionSet
      : update.docChanged || update.viewportChanged;
    const shouldUpdateButton = pluginRef?.settings?.inlineDynamicEdit
      ? this.considerNextSelectionChange && update.selectionSet
      : false;

    if (shouldUpdate) {
      this.buildDecorations(update.view);
    } else if (shouldUpdateButton) {
      this.considerNextSelectionChange = false;
      this.buildDecorations(update.view);
    }
  }

  destroy() {}

  buildDecorations(view: EditorView) {
    const isDynamicEdit = pluginRef?.settings?.inlineDynamicEdit;
    const builder = new RangeSetBuilder<Decoration>();
    const buildMeta: BuildMeta[] = [];
    const selection = view.state.selection;

    // For tabstop widget
    let widgetIndex = 0;

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
              })
            );
          }

          if (pluginRef?.settings?.inlineProgressMode === "track") {
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
                    showEdit: !isDynamicEdit,
                  }),
                })
              );
            }
          } else {
            if (CLOCK_REGEX.test(text)) {
              buildMeta.push(meta);
              builder.add(
                from,
                to,
                Decoration.replace({
                  widget: new ClockWidget({
                    originalNode: node.node,
                    originalText: text,
                    size: pluginRef?.settings?.inlineProgressMode || "clock",
                    dirty,
                    showEdit: !isDynamicEdit,
                  }),
                })
              );
            }
          }

          if (SPACE_REGEX.test(text)) {
            const thisWidgetIndex = widgetIndex;
            buildMeta.push(meta);
            builder.add(
              from,
              to,
              Decoration.replace({
                widget: new SpaceWidget({
                  originalNode: node.node,
                  originalText: text,
                  initialWidth:
                    this.spaceStore[meta] ||
                    this.spaceStoreIndex[thisWidgetIndex] ||
                    0,
                  updateInitialWidth: (width: number) => {
                    this.spaceStore[meta] = width;
                    this.spaceStoreIndex[thisWidgetIndex] = width;
                  },
                  dirty,
                }),
              })
            );
            widgetIndex++;
          }
        },
      });
    }

    if (!this.isMetaChanged(buildMeta)) return;
    this.previousBuildMeta = buildMeta;

    this.decorations = builder.finish();
  }

  isRangeSelected(
    from: number,
    to: number,
    selection: EditorSelection
  ): boolean {
    return !!selection.ranges.find(
      (range: SelectionRange) => range.from <= to && range.to >= from
    );
  }

  isMetaChanged(buildMeta: BuildMeta[]): boolean {
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

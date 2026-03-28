import { App, Editor, MarkdownView } from "obsidian";

type EditorWithPosAtMouse = Editor & {
  posAtMouse?: (event: MouseEvent) => { line: number; ch: number };
};

const findParentWidgetLines = ({
  app,
  event,
}: {
  app: App;
  event: MouseEvent;
}): [number, number] => {
  let lineStart = -1;
  let lineEnd = -1;

  // FIXME: read plugins in edit mode don't provide section info, so this is the only
  //        somewhat working solution for finding element position inside the document
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (view) {
    const editor = view.editor as EditorWithPosAtMouse;
    if (editor?.posAtMouse && typeof editor?.posAtMouse === "function") {
      const position = editor.posAtMouse(event);
      if (position) {
        lineStart = position.line;
        lineEnd = lineStart + 500; // Dunno how many lines the parent element will be, we'll hope for the best here
      }
    }
  }

  return [lineStart, lineEnd];
};

export const getWidgetLines = (
  { lineStart, lineEnd, app }: { lineStart: number; lineEnd: number; app: App },
  event: MouseEvent,
): [number, number] => {
  if ((lineStart === -1 || lineEnd === -1) && event) {
    return findParentWidgetLines({ app, event });
  } else {
    return [lineStart, lineEnd];
  }
};

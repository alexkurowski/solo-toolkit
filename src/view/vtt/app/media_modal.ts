import { Notice, SuggestModal } from "obsidian";

export class VttMediaModal extends SuggestModal<string> {
  getSuggestions(query: string): string[] {
    console.log("getSuggestions", query);
    return [];
  }

  // Renders each suggestion item.
  renderSuggestion(text: string, el: HTMLElement) {
    el.createEl("div", { text });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(text: string, _event: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${text}`);
  }
}

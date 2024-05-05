import {
  ButtonComponent,
  ExtraButtonComponent,
  setIcon,
  setTooltip,
} from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Deck } from "../utils";

export class DeckView {
  view: View;
  deck: Deck;
  countEl: HTMLElement;
  deckBtnsEl: HTMLElement;
  deckResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.deck = new Deck();
  }

  create() {
    this.deck.setJokers(this.view.settings.deckJokers);

    if (this.view.isMobile) {
      this.deckResultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.deckBtnsEl = this.view.tabViewEl.createDiv("deck-buttons");
    this.deckBtnsEl.empty();
    this.createDeckBtns();

    if (!this.view.isMobile) {
      this.deckResultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.repopulateResults();
  }

  addResult(value: string, suit: string, immediate = false) {
    const elClass = ["deck-result"];
    if (immediate) elClass.push("shown");
    const el = this.deckResultsEl.createDiv(elClass.join(" "));

    let tooltipValue = value;
    if (value === "J") tooltipValue = "Jack";
    if (value === "Q") tooltipValue = "Queen";
    if (value === "K") tooltipValue = "King";
    if (value === "A") tooltipValue = "Ace";
    setTooltip(el, `${tooltipValue} of ${suit}s`);

    const valueEl = el.createSpan("deck-result-value");
    valueEl.setText(value);

    const typeEl = el.createSpan("deck-result-type");
    setIcon(typeEl, suit);

    if (!immediate) {
      setTimeout(() => {
        el.classList.add("shown");
      }, 30);
    }
  }

  createDeckBtns() {
    this.countEl = this.deckBtnsEl.createDiv("deck-size");
    this.updateCount();

    new ButtonComponent(this.deckBtnsEl)
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit] = this.deck.draw();
        this.addResult(value, suit);
        this.updateCount();
      });

    new ExtraButtonComponent(this.deckBtnsEl)
      .setIcon("refresh-ccw")
      .setTooltip("Shuffle")
      .onClick(() => {
        this.deck.shuffle();
        this.deckResultsEl.empty();
        this.updateCount();
      });
  }

  updateCount() {
    if (this.countEl) {
      this.countEl.setText(`${this.deck.size()} / ${this.deck.max()}`);
    }
  }

  repopulateResults() {
    for (const drawn of this.deck.drawn) {
      const [value, suit] = drawn;
      this.addResult(value, suit, true);
    }
  }
}

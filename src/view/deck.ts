import { ButtonComponent, setIcon, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Deck, capitalize } from "../utils";

const MAX_REMEMBER_SIZE = 1000;

export class DeckView {
  view: View;
  deck: Deck;
  drawn: [string, string][];
  countEl: HTMLElement;
  deckBtnsEl: HTMLElement;
  deckResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.deck = new Deck();
    this.drawn = [];
  }

  create() {
    this.deck.setJokers(this.view.settings.deckJokers);

    if (this.view.isMobile) {
      this.deckResultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.deckBtnsEl = this.view.tabViewEl.createDiv("deck-buttons");
    this.deckBtnsEl.empty();
    this.createDeckBtns();
    this.createCounter();

    if (!this.view.isMobile) {
      this.deckResultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.repopulateResults();
  }

  reset() {
    this.deck.shuffle();
    this.drawn = [];
    this.deckResultsEl.empty();
    this.updateCount();
  }

  addResult(value: string, suit: string, immediate = false) {
    const isRed = suit === "heart" || suit === "diamond" || suit === "red";
    // const isBlack = suit === "club" || suit === "spade" || suit === "black";
    const isSuit = suit !== "red" && suit !== "black";

    const elClass = ["deck-result"];
    if (immediate) elClass.push("shown");
    if (isRed) elClass.push("deck-result-red");
    const el = this.deckResultsEl.createDiv(elClass.join(" "));

    let tooltipValue = value;
    if (value === "J") tooltipValue = "Jack";
    if (value === "Q") tooltipValue = "Queen";
    if (value === "K") tooltipValue = "King";
    if (value === "A") tooltipValue = "Ace";
    if (value === "Joker") tooltipValue = "joker";
    if (isSuit) {
      setTooltip(el, `${tooltipValue} of ${suit}s`);
    } else {
      setTooltip(el, `${capitalize(suit)} ${tooltipValue}`);
    }

    const valueEl = el.createSpan("deck-result-value");
    valueEl.setText(value);

    if (isSuit) {
      const typeEl = el.createSpan("deck-result-type");
      setIcon(typeEl, suit);
    }

    if (!immediate) {
      setTimeout(() => {
        el.classList.add("shown");
      }, 30);
    }
  }

  createDeckBtns() {
    new ButtonComponent(this.deckBtnsEl)
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit] = this.deck.draw();
        this.drawn.push([value, suit]);
        this.addResult(value, suit);
        this.updateCount();
      });

    new ButtonComponent(this.deckBtnsEl)
      .setButtonText("Shuffle")
      .onClick(() => {
        this.deck.shuffle();
        this.updateCount();
      });
  }

  createCounter() {
    this.countEl = this.deckBtnsEl.createDiv("deck-size");
    this.updateCount();
  }

  updateCount() {
    const [current, max] = this.deck.size();
    if (this.countEl) this.countEl.setText(`${current} / ${max}`);
  }

  repopulateResults() {
    while (this.drawn.length > MAX_REMEMBER_SIZE) {
      this.drawn.shift();
    }

    for (const drawn of this.drawn) {
      const [value, suit] = drawn;
      this.addResult(value, suit, true);
    }
  }
}

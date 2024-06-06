import { ButtonComponent, setIcon, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Deck, capitalize, clickToCopy } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class DeckView {
  view: View;
  deck: Deck;
  drawn: [string, string][];
  countEl: HTMLElement;
  btnsEl: HTMLElement;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.deck = new Deck(this.view.settings.deckJokers);
    this.drawn = [];
  }

  create() {
    this.deck.setJokers(this.view.settings.deckJokers);

    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.btnsEl = this.view.tabViewEl.createDiv("deck-buttons");
    this.btnsEl.empty();
    this.createDeckBtns();
    this.createCounter();

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.repopulateResults();
  }

  reset() {
    this.deck.shuffle();
    this.drawn = [];
    this.resultsEl.empty();
    this.updateCount();
  }

  addResult(value: string, suit: string, immediate = false) {
    const isRed = suit === "heart" || suit === "diamond" || suit === "red";
    const isBlack = suit === "club" || suit === "spade" || suit === "black";
    const isSuit = suit !== "red" && suit !== "black";

    const parentElClass = ["deck-result"];
    if (immediate) parentElClass.push("nofade");
    const parentEl = this.resultsEl.createDiv(parentElClass.join(" "));

    const elClass = ["deck-result-content"];
    if (isRed) elClass.push("deck-result-red");
    if (isBlack) elClass.push("deck-result-black");
    const el = parentEl.createDiv(elClass.join(" "));

    let tooltipValue = value;
    if (value === "J") tooltipValue = "Jack";
    if (value === "Q") tooltipValue = "Queen";
    if (value === "K") tooltipValue = "King";
    if (value === "A") tooltipValue = "Ace";
    if (value === "Joker") tooltipValue = "joker";
    const tooltipText = isSuit
      ? `${tooltipValue} of ${suit}s`
      : `${capitalize(suit)} ${tooltipValue}`;
    setTooltip(parentEl, tooltipText);
    parentEl.onclick = clickToCopy(tooltipText);

    const valueEl = el.createSpan("deck-result-value");
    valueEl.setText(value);

    if (isSuit) {
      const typeEl = el.createSpan("deck-result-type");
      setIcon(typeEl, suit);
    }
  }

  createDeckBtns() {
    new ButtonComponent(this.btnsEl)
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit] = this.deck.draw();
        this.drawn.push([value, suit]);
        this.addResult(value, suit);
        this.updateCount();
      });

    new ButtonComponent(this.btnsEl).setButtonText("Shuffle").onClick(() => {
      this.deck.shuffle();
      this.updateCount();
    });
  }

  createCounter() {
    this.countEl = this.btnsEl.createDiv("deck-size");
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

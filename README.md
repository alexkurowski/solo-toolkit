# Solo RPG Toolkit

A plugin for Obsidian (https://obsidian.md) that adds helpful features for playing TTRPGs. Its features are mainly geared towards solo gameplay using a GM emulator.

## Features

### Dice roller

Quickly roll a bunch of dice by clicking on a die icon.

### Deck of cards

A standard deck of 52 cards plus two optional joker cards.

### Random generators

A set of random word generators. Great for coming up with ideas on how to progress the story.

### Custom random tables

In addition to default random word generators, you can may add any number of your own random tables, by creating notes inside a special folder in your vault (default folder name is "Tables", you can change it in plugin settings).

### Custom table templates

By default a custom random table roll will return a random line from the note. You can further customize this behavior with templates.

You can add one or multiple templates as properties of the note (simply type `---` at the start of the note). The value of a property can contain regular text as well as keywords inside curly brackets (`{keyword}`), those keywords will be replace with a random word from that section of the note.

Example of a note with templates:

```markdown
---
loves: "{name} loves {food} ({how much})"
hates: "{name} hates {food} ({how much})"
---

## Names
James
Louie
Quinn
Drew
Melissa
Martha
Elsa
Emily

## Food
pizza
sushi
burgers
tacos
tea
coffee

## How much
very much
a little
```

### Inline dynamic counters

Code blocks with a single number in it (e.g. `` `5` ``) will be rendered with - and + buttons for quick adjustment.

Note that this feature is disabled by default and can be enabled in plugin settings.

### Inline progress trackers

Similar to counters, code blocks with two numbers separated by a slash (e.g. `` `1/5` ``) will be rendered as a set of checkable boxes. For PbtA-style clocks and general progress tracking.

Note that this feature is disabled by default and can be enabled in plugin settings.

## Installation

### From GitHub Release

Download solo-rpg-toolkit.zip from the latest release, and extract the plugin folder into your vault's plugins folder: `<path-to-vault>/.obsidian/plugins/`.

Note that `.obsidian` folder in your vault may be hidden on Linux and MacOS.

### From source

You'll need at least node-18 to be installed on your machine. Run the following commands while inside the source folder:

```
npm install
npm run build
npm run deploy
```

You will find a newly generated plugin folder `solo-rpg-toolkit` inside folder `dist`. Move the `solo-rpg-toolkit` plugin folder into your vault's plugins folder: `<path-to-vault>/.obsidian/plugins/`.

Note that `.obsidian` folder in your vault may be hidden on Linux and MacOS.

### Updating

Simply replace `<path-to-vault>/.obsidian/plugins/solo-rpg-toolkit` folder with a new one.

Note that plugin settings are stored in the file `<path-to-vault>/.obsidian/plugins/solo-rpg-toolkit/data.json`. You may want to keep it after updating to a newer version.

## Feature and content requests

If you have an idea for a new feature or new content, feel free to create an "issue" on github or reach me at kurowski.dev@gmail.com!

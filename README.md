# Solo RPG Toolkit

A plugin for Obsidian (https://obsidian.md) that adds helpful features for playing TTRPGs. Its features are mainly geared towards solo gameplay using a GM emulator.

## Features

### Dice roller

Quickly roll a bunch of dice by clicking on a die icon. Hold shift, or right click/long tap to roll dice with alternative color.

### Deck of cards

A standard deck of 52 cards plus two optional joker cards, and a deck of oracle major arcana cards.

### Custom decks

You can add any number of your own decks by creating folders of images in a special folder of your vault (default folder name is "Decks", you can change it in plugin settings). This feature can be useful with products like "The GameMaster's Apprentice" VTT decks, but can also be used with any kind of images: maps, item icons, or portraits.

#### Other custom deck options

- Cards can be rotated in your custom deck. Create a note inside your deck folder and add a word `flip` to randomize upright and upside down cards. Other options are `flip2` for upright and tapped, `flip3` for upright and tapped in both directions, `flip4` for random rotation.
- Cards can be added as URLs instead of image files. Create a note inside your deck folder and paste links to images you want to use.
- Right click on a card will shuffle it back in.

### Random generators

A set of random word generators. Great for coming up with ideas on how to progress the story.

### Custom random tables

In addition to default random word generators, you may add any number of your own random tables by creating notes inside a special folder in your vault (default folder name is "Tables", you can change it in plugin settings). To create more table categories, organize your notes into subfolders.

### Custom table templates

By default a custom random table roll will return a random line from the note. You can further customize this behavior with templates.

You can add one or multiple templates as properties of the note (simply type `---` at the start of the note). The value of a property can contain regular text as well as keywords inside curly brackets (`{keyword}`), those keywords will be replaced with a random word from a given section of the note.

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

#### Other keyword options:

- Refer to other notes by specifying the note name and/or note section: `{note_name/section_title}`, or `{folder_name/note_name/section_title}`, or simply `{note_name}` if there are no sections.
- Refer to any note in the vault by its full path: `{/folder_name/subfolder_name/note_name}`.
- Refer to all sections in all notes from a specific folder: `{folder_name}`.
- Refer to multiple sections by listing them separately: `{name|food}`.
- Get a random note title inside a subfolder: `{folder_name/*}`. In order to display note's content instead of its name: `{folder_name/!}`.
- Repeat the same word multiple times: `{noun} and {<noun}`.
- Utilize built-in dictionaries by using any of the following keywords: `{noun}`, `{verb}`, `{adjective}`, `{adverb}`, `{job}`, `{aspect}`, `{town name}`, `{a}`.
- Add bell curve probability by adding Xd at the end of note name or section (e.g. `Clues 2d.md` or `# Food 3d`).
- Add weight to specific template by adding a value to its name: `loves ^10: loves {food}`
- Add weight to specific line of a note by adding a value at the end: `pizza ^10`
- Template key can be capitalized (e.g. `Loves: {food}`) if you'd like to ensure sentence capitalization.
- You can hide a subfolder from dropdown menu by adding a dot at the end of folder's name: `/Items.`, they can still be referenced with a keyword: `{item}`.

#### Cut-up method mode

Custom table notes can also be used in a "cut-up method" mode. Copy-paste any book (or any source material) content into a note, and add a note property `mode: cutup` (type `---` at the start of the note).

In this mode, a random snippet from the note will be returned, instead of a random line.

### Inline elements

This plugin also adds a few inline elements that can be helpful when playing TTRPGs.

Note that these elements are disabled by default and can be enabled in plugin settings.

#### Dynamic counters

Code blocks with a single number in it (e.g. `` `5` ``) will be rendered with - and + buttons for quick adjustment.

#### Progress trackers

Code blocks with two numbers separated by a slash (e.g. `` `1/5` ``) will be rendered as a set of checkable boxes or as a clock. Useful for PbtA-style clocks and general progress tracking.

To use specific tracker style:
- Boxes — `` `boxes: 1/5` `` or `` `b:1/5` ``
- Clock — `` `clock: 1/5` `` or `` `c:1/5` ``
- Smaller clock — `` `smclock: 1/5` `` or `` `sc:1/5` ``
- Larger clock — `` `lgclock: 1/5` `` or `` `lc:1/5` ``

#### Dice

Code block with dice notation (e.g. `` `d6` `` or `` `2d8` ``) will be rendered as a dice button that can be rolled by clicking on it.

To change a die color — `` `d6,red` `` or `` `d6,#fb464c` ``

Possibility to roll with advantage (roll multiple dice and take the higest) and disadvantage (roll multiple dice and take the lowest) `` `2d6/a` `` or `` `2d6/d` ``

#### Tab stops

Code blocks with only spaces (e.g. `` ` ` ``) will be rendered as a blank space with a set width. Useful when you need a table-like formatting without an actual table.

Example of formatted stats with dynamic counters:

```markdown
Wounds ` ` `1`
Stress `  ` `2`
```

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

# Project Katana Source Release

**TypeScript/nw.js visual novel engine**

**XCVG Systems 2017-2019**

## Introduction

This is the source code for [Project Katana](https://xcvg.itch.io/katana), a now-abandoned visual novel. It is written in TypeScript and runs in nw.js. 

This project- game *and* engine- is basically abandoned at this point, but perhaps you can make some use of it. At this point it's good enough to get a basic game running, but still missing a lot of features.

## Notes

The engine was going to be named OpenVNS at some point so that's why there's references to that.

Everything is done with HTML elements on the DOM, there is no Canvas. It's a bit unusual, and I'm not sure if it was a great decision or a horrible one.

I don't think the battle system works at all. Quests are tracked but there's no quest log, and the inventory system is probably broken. Everything else is mostly working.

Most of the asset folders are self-explanatory. Backgrounds go in the `bg` folder, character heads go in the `char` folder, music in the `mus` folder, scene files in the `scenes` folder, sound effects in the `sfx` folder, and videos in the `video` folder. Standing character images or other images used for hotspots are considered UI graphics and go in the `ui` folder. The `data` folder contains inventory and quest definitions, initial state, and a legacy file with multiple scenes in it.

The scene format is poorly documented. I've included what notes I have, as well as some example scenes. It's 90% the same as what [CommonCore](https://github.com/XCVG/commoncore/) uses for dialogue (at least at this point in time).

This won't run in a browser as-is because it relies on node.js functions for file handling and possibly a few other things. To adapt it, you'd need to rework the way assets are loaded and modify save state functionality to use something like cookies, localStorage, or IndexedDB.

The April 2019 demo of Project Katana isn't protected in any way, so you can download that and tear it apart to get an idea of how a game should actually be put together.

## License

The code and included assets are licensed under the MIT License. The fonts, project template, libraries and definition files are provided by third-parties under various licenses. See the CREDITS file for details.

## Acknowledgements

BCIT Game Dev Club for inspiring this in the first place, though I'm not sure how it happened.

Hank Lo (aify) for his contributions to the game before it was abandoned.

JSON Editor Online, which a shockingly large proportion of the game was written in.

The people behind nw.js, Chromium, node.js, TypeScript, jQuery, and a few other projects for building the technological foundation that underpins this whole thing.
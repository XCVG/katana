/// <reference path="typings/node/index.d.ts" />
/// <reference path="typings/jquery.d.ts" />
/// <reference path="soundmanager.ts" />
/// <reference path="imagemanager.ts" />
/// <reference path="gamestate.ts" />
/// <reference path="gameengine.ts" />
/// <reference path="gamedata.ts" />
/// <reference path="configstate.ts" />

//hacks (TODO move)
declare interface ObjectConstructor
{
    assign(...objects: Object[]): Object;
}

declare var nw: any;

//global refs
let globalState: GameState;
let globalConfig: ConfigState;
let globalData: GameData;
let globalEngine: GameEngine;
let globalImageManager: ImageManager;
let globalSoundManager: SoundManager;
let hwnd: any;

//import * as fs from "fs";
//import FS = require('fs');
const fs = require('fs');
const path = require('path');

const gameDataFolder = "XCVG Systems/katana/";

let moduleLoadCount: number = 0;

$(document).ready(function ()
{
    hwnd = nw.Window.get();

    globalEngine = new GameEngine();
    globalImageManager = new ImageManager();
    globalSoundManager = new SoundManager();
    globalData = new GameData();
    globalConfig = new ConfigState();
    
    //load game data, blank game state, setup image and sound managers
    //something something async load

    //display loading indicator, start load wait
    moduleLoadCount++;    
    moduleLoadCount++;    
    moduleLoadCount++;    
    moduleLoadCount++;

    globalImageManager.load();
    globalSoundManager.load();
    globalData.load();
    globalConfig.load();

    $("body>h1").html("OpenVNS Loading...");
    console.log("Modules To Load: " + moduleLoadCount);
});

function signalModuleLoadDone()
{
    moduleLoadCount--;
    checkAllLoadDone();
}

function checkAllLoadDone()
{
    console.log("Modules To Load: " + moduleLoadCount);
    if (moduleLoadCount == 0)
        onAllLoadDone();
}

function onAllLoadDone()
{
    //all loading is finished, start engine
    console.log("Loading complete, starting game engine!");
    globalEngine.start();
}

//hack from the stack
function ensureDirectoryExistence(filePath)
{
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname))
    {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
/// <reference path="framecontroller.ts" />
/// <reference path="mainmenucontroller.ts" />
/// <reference path="inventorycontroller.ts" />
/// <reference path="videoframecontroller.ts" />

//GameEngine contains the majority of game code
class GameEngine
{

    //state
    private currentFrame: FrameController;

    private _rootNode: HTMLElement;
    private _menuBar: HTMLElement;

    get rootNode(): HTMLElement
    {
        return this._rootNode;
    }

    get menuBar(): HTMLElement
    {
        return this._menuBar;
    }

    get menuBarEnabled(): boolean
    {
        return $(this._menuBar).is(":visible");
    }

    set menuBarEnabled(newState: boolean)
    {
        if (newState)
            $(this._menuBar).show();
        else
            $(this._menuBar).hide();
    }

    get savePath(): string
    {
        return process.env.APPDATA + "/" + gameDataFolder + "save.json";
    }

    //setup/basic methods

    start()
    {
        //init gamestate (load defaults)
        //globalState = new GameState();
        globalState = GameState.deserialize(globalData.initial);

        //setup game HTML
        this.setupHTML();

        //setup menu bar
        this.paintMenu();

        //display initial game screen (load menu?)
        this.currentFrame = new MainMenuController();
        this.currentFrame.present();
    }

    changeFrame(scene: string, frame?: string)
    {

        //handle "meta" scenes
        if (scene == "meta")
        {
            if (frame == "menu")
            {
                this.currentFrame = new MainMenuController();
            }
            else if (frame == "main")
            {
                globalState = GameState.deserialize(globalData.initial);
                //this.saveGame(); //for starting a new game
                //start default frame (entry point) TODO find a more elegant way to do this
                this.changeFrame("intro");
                return;
            }
            else if (frame == "continue")
            {
                this.loadGame();
                let nextScene: string = null;
                let nextFrame: string = null;
                let loc = globalState.location.split(".");
                nextScene = loc[0];
                if (loc.length > 1)
                    nextFrame = loc[1];
                this.changeFrame(nextScene, nextFrame);
                return;
            }
            else if (frame == "end")
            {
                //endgame
                this.currentFrame = new EndFrameController();
            }
            else if (frame == "restart")
            {
                //restart game?
                window.location.reload();
            }
            else
            {
                console.log("Invalid meta frame: " + frame);
            }
        }
        //else search gamedata
        else
        {

            //handle this or null scene
            if (!scene || scene === "this")
            {
                scene = this.currentFrame.scene;
            }

            let sceneData = globalData.scenes[scene];

            //handle the null frame
            if (!frame)
            {
                frame = sceneData.default;
            }

            if (globalConfig.useAutosave && !(globalState.flags.indexOf("SuppressAutosave") >= 0) && (this.currentFrame.scene != scene))
            {
                this.saveGame(false);
                console.log("Autosaving...");
            }
                

            let newLoc = scene + "." + frame;
            globalState.location = newLoc;
            console.log(newLoc);

            //TODO handle broken cases

            //we actually only need type info here
            let frameData = sceneData.frames[frame];

            if (!frameData)
                console.log("Frame " + newLoc + "has no data!");

            //create the right kind of frame
            if (frameData.type == "image")
            {
                this.currentFrame = new ImageFrameController(scene, frame);
            }
            else if (frameData.type == "text")
            {
                this.currentFrame = new TextFrameController(scene, frame);
            }
            else if (frameData.type == "choice")
            {
                this.currentFrame = new ChoiceFrameController(scene, frame);
            }
            else if (frameData.type == "area")
            {
                this.currentFrame = new AreaFrameController(scene, frame);
            }
            else if (frameData.type == "battle")
            {
                this.currentFrame = new BattleFrameController(scene, frame);
            }
            else if (frameData.type == "video")
            {
                this.currentFrame = new VideoFrameController(scene, frame);
            }
            else if (frameData.type == "blank")
            {
                this.currentFrame = new BlankFrameController(scene, frame);
            }
            else
            {
                console.log("Unrecognized frame type " + frameData.type);
            }
        }

        this.flushContent();
        this.currentFrame.present();
        this.paintMenu();
    }

    setupHTML(): void
    {
        //setup body
        $(document.body).empty();
        let gameContainer = document.createElement("div");
        $(gameContainer).addClass("gameContainer");
        $(document.body).append(gameContainer);

        let gameDiv = document.createElement("div");
        $(gameDiv).addClass("gameArea");
        $(gameContainer).append(gameDiv);
        this._rootNode = gameDiv;

        let menuDiv = document.createElement("div");
        $(menuDiv).addClass("menuArea");
        $(gameContainer).append(menuDiv);
        this._menuBar = menuDiv;
        
        this._rootNode = gameDiv;
    }

    paintMenu(): void
    {
        //clear menubar
        $(this.menuBar).empty();

        //title text
        {
            let titleEl = $("<h1>");
            if (this.currentFrame)
            {
                if (this.currentFrame.hasOwnProperty("title") && (<any>this.currentFrame).title)
                    titleEl.text((<any>this.currentFrame).title);
            }

            $(this.menuBar).append(titleEl);
        }

        //exit button
        /*
        {
            let buttonEl = $("<button>");
            buttonEl.css("left", "16px");
            buttonEl.css("background-image", ("url(" + globalImageManager.getUiImage("b_exit").src + ")"));
            buttonEl.on("click", () => this.exitGame(true));

            $(this.menuBar).append(buttonEl);
        }
        */

        //config button
        {
            let buttonEl = $("<button>");
            buttonEl.css("left", "16px");
            buttonEl.css("background-image", ("url(" + globalImageManager.getUiImage("b_config").src + ")"));
            buttonEl.on("click", () => this.showConfig());

            $(this.menuBar).append(buttonEl);
        }

        //save button
        {
            let buttonEl = $("<button>");
            buttonEl.css("left", "80px");
            buttonEl.css("background-image", ("url(" + globalImageManager.getUiImage("b_save").src + ")"));
            buttonEl.on("click", () => this.saveGame(true));

            $(this.menuBar).append(buttonEl);
        }

        //inventory button
        {
            let buttonEl = $("<button>");
            buttonEl.css("left", "144px");
            buttonEl.css("background-image", ("url(" + globalImageManager.getUiImage("b_inventory").src + ")"));
            buttonEl.on("click", () => this.showInventory()); //TODO overlay management

            $(this.menuBar).append(buttonEl);
        }

        //day text
        {
            let text: string = "Day " + globalState.day;

            let textEl = $("<p>");
            textEl.css("right", "16px");
            textEl.css("color", "green");
            textEl.text(text);
            $(this.menuBar).append(textEl);
        }

        //money text
        {
            let text: string = "$" + globalState.playerMoney;

            let textEl = $("<p>");
            textEl.css("right", "128px");
            textEl.css("color", "red");
            textEl.text(text);
            $(this.menuBar).append(textEl);
        }
    }

    exitGame(showPrompt?: boolean): void
    {
        if (showPrompt)
            if (!confirm("Are you sure you wish to exit?"))
                return;

        eval("nw.App.quit()"); //error steamrolling 101
    }

    saveGame(showPrompt?: boolean): void
    {
        if (showPrompt)
        {
            if (!confirm("This will overwrite your current save game. Continue?"))
                return;
        }

        console.log("saved game");  

        if (!this.checkSaveExists())
        {
            ensureDirectoryExistence(this.savePath);
        }

        let saveContents = GameState.serialize(globalState);
        fs.writeFileSync(this.savePath, saveContents);                  
    }

    showInventory(): void
    {
        new InventoryController(this._rootNode);
    }

    showConfig(): void
    {
        new ConfigController(this._rootNode);
    }

    loadGame(): void
    {
        console.log("loaded game");

        let saveContents = fs.readFileSync(this.savePath, "utf-8");
        globalState = GameState.deserialize(saveContents);
    }

    checkSaveExists(): boolean
    {
        try
        {
            fs.accessSync(this.savePath);
        }
        catch(e)
        {
            console.log(e);
            return false;                                
        }

        return true;
    }

    //draw methods
    flushContent(): void
    {
        $(this._rootNode).empty();
    }

    drawBackground(newBackground: string): void
    {
        try
        {
            let image = globalImageManager.getBgImage(newBackground);
            let imageSource = image.src;
            let imageString = "url(" + imageSource + ")";
            $(this._rootNode).css("background-image", imageString);
        }
        catch (e)
        {
            $(this._rootNode).css("background-image", "");
            console.log(e);
        }
    }

}
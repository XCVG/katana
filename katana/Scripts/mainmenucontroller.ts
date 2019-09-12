/// <reference path="framecontroller.ts" />

class MainMenuController extends FrameController
{
    present(): void
    {
        //play music
        globalSoundManager.playMusic("title");

        //disable menubar
        globalEngine.menuBarEnabled = false;

        //draw background
        globalEngine.drawBackground("title");

        //draw menubox
        let menuBox = $(document.createElement("div"));
        menuBox.css("display", "block");
        menuBox.css("margin", "250px auto auto auto");
        menuBox.css("width", "400px");
        menuBox.css("height", "260px");
        menuBox.css("background-color", "rgba(0, 64, 192, 0.25)");
        menuBox.css("overflow", "auto");
        $(globalEngine.rootNode).append(menuBox);

        //create, bind, and append buttons
        let buttonStart = $(document.createElement("button"));
        buttonStart.click((evt) => this.onClickStart(evt));
        buttonStart.text("New Story")
        menuBox.append(buttonStart);

        if (globalEngine.checkSaveExists())
        {
            let buttonContinue = $(document.createElement("button"));
            buttonContinue.click((evt) => this.onClickContinue(evt));
            buttonContinue.text("Continue Story")
            menuBox.append(buttonContinue);
        }

        let buttonConfig = $(document.createElement("button"));
        buttonConfig.click((evt) => this.onClickConfigure(evt));
        buttonConfig.text("Configuration")
        menuBox.append(buttonConfig);

        let buttons = $(menuBox.children());
        buttons.css("display", "block");
        buttons.css("margin", "20px auto 0 auto");
        buttons.css("width", "80%");
        buttons.css("height", "60px");
        buttons.css("font-family", "Inconsolata");
        buttons.css("font-size", "24pt");
        
    }

    onClickStart(evt: any): void
    {
        globalEngine.changeFrame("meta", "main");
    }

    onClickContinue(evt: any): void
    {
        globalEngine.loadGame();
        globalEngine.changeFrame("meta", "continue");
    }

    onClickConfigure(evt: any): void
    {
        globalEngine.showConfig();
    }

}
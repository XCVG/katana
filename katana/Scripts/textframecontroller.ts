class TextFrameController extends GameFrameController
{

    private text: string;
    private nameText: string;
    private nextText: string;
    private useNextDelay: boolean; //does nothing yet

    constructor(scene: string, frame: string)
    {
        super(scene, frame);

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        //try to parse imagePosition or default
        this.imagePosition = FrameImagePosition.Center;
        if (sceneData.hasOwnProperty("position"))
        {
            this.imagePosition = GameFrameController.parsePosition(sceneData.position);
        }
        if (frameData.hasOwnProperty("position"))
        {
            this.imagePosition = GameFrameController.parsePosition(frameData.position);
        }

        //we should all have this
        if (sceneData.hasOwnProperty("text"))
            this.text = sceneData.text;
        if (frameData.hasOwnProperty("text"))
            this.text = frameData.text;

        //we might have these
        if (sceneData.hasOwnProperty("nextText"))
            this.nextText = sceneData.nextText;
        if (frameData.hasOwnProperty("nextText"))
            this.nextText = frameData.nextText;
        else
            this.nextText = "Continue...";

        if (sceneData.hasOwnProperty("nameText"))
            this.nameText = sceneData.nameText;
        if (frameData.hasOwnProperty("nameText"))
            this.nameText = frameData.nameText;
        else
            this.nameText = null;

    }

    present(): void
    {
        super.present();

        //paint image
        this.paintImage(this.image, this.imagePosition);

        //paint textbox, text, and prompt
        let convoBox = $(document.createElement("div"));
        convoBox.addClass("convoBox");

        if (this.nameText)
        {
            //paint name text
            let convoTitle = $(document.createElement("div"));
            convoTitle.addClass("convoTitle");
            convoTitle.text(this.nameText);
            convoBox.append(convoTitle);
        }

        let convoText = $(document.createElement("p"));
        convoText.addClass("convoText");
        convoText.html(this.text);
        convoBox.append(convoText);

        let convoNext = $(document.createElement("p"));
        convoNext.addClass("convoNext");
        convoNext.html(this.nextText);
        convoNext.on("click", (evt) => this.onContinue(evt));
        convoBox.append(convoNext);

        $(globalEngine.rootNode).append(convoBox);

    }

    onContinue(evt?: any): void
    {
        console.log("Continue!");
        this.gotoNext(evt);
    }
    
}
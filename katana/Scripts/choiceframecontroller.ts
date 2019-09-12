/// <reference path="framecontroller.ts" />

class ChoiceFrameController extends GameFrameController
{
    protected text: string;
    protected nameText: string;

    protected choices: any[];

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
        if(frameData.hasOwnProperty("text"))
            this.text = frameData.text;

        //we might have this
        if (sceneData.hasOwnProperty("nameText"))
            this.nameText = sceneData.nameText;
        if (frameData.hasOwnProperty("nameText"))
            this.nameText = frameData.nameText;
        else
            this.nameText = null;

        //get choices objects
        if (frameData.hasOwnProperty("choices") && frameData.choices)
        {
            this.choices = frameData.choices.slice();
        }
        else
        {
            console.log("No choices for choice frame!");
        }
    }

    present()
    {
        super.present();

        //paint image
        this.paintImage(this.image, this.imagePosition);

        //paint textbox, text, title
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
        convoText.css("height", "30%");
        convoText.html(this.text);
        convoBox.append(convoText);

        //paint choices
        for (let i: number = 0; i < this.choices.length; i++)
        {
            let choiceData = this.choices[i];
            if (choiceData.hasOwnProperty("showCondition") && choiceData.showCondition)
            {
                if (!this.checkCondition(choiceData.showCondition))
                    continue;
            }
            let convoChoice = $(document.createElement("p"));
            convoChoice.addClass("convoChoice");
            convoChoice.html(choiceData.text);
            convoChoice.on("click", (evt) => this.onContinueEx(evt, i));
            convoBox.append(convoChoice);
        }

        //push
        $(globalEngine.rootNode).append(convoBox);
    }

    onContinueEx(evt: any, choice: number)
    {
        let choiceNode = this.choices[choice];
        let next = choiceNode.next;

        let microscript: any = null;

        if (choiceNode.hasOwnProperty("microscript") && choiceNode.microscript)
        {
            microscript = choiceNode.microscript;
        }

        if (choiceNode.hasOwnProperty("conditional") && choiceNode.conditional)
        {
            this.gotoNextConditional(choiceNode.conditional, microscript);
        }
        else
        {
            let nextScene: string = null;
            let nextFrame: string = null;
            let loc = next.split(".");
            nextScene = loc[0];
            if (loc.length > 1)
                nextFrame = loc[1];

            this.gotoNextSpecific(nextScene, nextFrame, microscript);
        }

        
    }
}
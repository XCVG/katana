/// <reference path="framecontroller.ts" />

class BlankFrameController extends FrameController
{
    private nextMicroscript: any;
    private nextConditional: any;

    constructor(scene: string, frame: string)
    {
        super();
        this._scene = scene;
        this._frame = frame;

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        //get normal next if exists
        if (frameData.hasOwnProperty("next"))
        {
            let loc = frameData.next.split(".");
            this.nextScene = loc[0];
            if (loc.length > 1)
                this.nextFrame = loc[1];
            else
                this.nextFrame = null;
        }

        //get conditionals if exists
        if (frameData.hasOwnProperty("conditional") && frameData.conditional.length > 0)
        {
            this.nextConditional = frameData.conditional; //we will interpret on execute
        }

        //get microscripts if exists
        if (frameData.hasOwnProperty("microscript"))
        {
            this.nextMicroscript = frameData.microscript;
        }

        //console.log(JSON.stringify(this));
    }

    present(): void
    {
        //immediately execute and go to the next frame
        this.gotoNext();
    }

    private gotoNext(): void
    {
        if (this.nextMicroscript)
        {
            console.log(JSON.stringify(this.nextMicroscript));
            this.resolveMicroscript(this.nextMicroscript);
        }

        if (this.nextConditional)
        {
            //console.log(JSON.stringify(this.nextConditional));

            let next = this.resolveConditional(this.nextConditional);

            let nextScene: string = null;
            let nextFrame: string = null;

            let loc = next.split(".");
            nextScene = loc[0];
            if (loc.length > 1)
                nextFrame = loc[1];

            console.log(nextScene + "." + nextFrame);

            globalEngine.changeFrame(nextScene, nextFrame);
        }
        else
        {
            if ((!this.nextScene || !this.nextFrame))
                console.log("Missing nextScene and/or nextFrame!");

            globalEngine.changeFrame(this.nextScene, this.nextFrame);
        }


    }

}
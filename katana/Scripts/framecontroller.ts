abstract class FrameController
{
    protected _scene: string;
    protected _frame: string;

    protected nextScene: string;
    protected nextFrame: string;

    abstract present(): void;

    get scene(): string
    {
        return this._scene;
    }

    get frame(): string
    {
        return this._frame;
    }

    //TODO move the following methods to Conditional/Microscript classes like they are in CommonCore

    //process conditional method
    protected resolveConditional(conditional: any): string {
        let qualifiedNext: string = null;

        //check conditionals from end to start (RPG Maker convention)
        for (let i: number = conditional.length - 1; i >= 0; i--) {
            let conditionNode: any = conditional[i];
            let next: string = conditionNode.next;
            let conditions = conditionNode.conditions;
            let conditionsSatisfied: number = 0;
            for (let j: number = 0; j < conditions.length; j++) //could optimize this by going to a reject-on-fail system
            {
                let conditionSatisfied = this.checkCondition(conditions[j]);
                console.log(conditionSatisfied);
                if (conditionSatisfied)
                    conditionsSatisfied++;
            }

            console.log(conditionsSatisfied);

            if (conditionsSatisfied == conditions.length) {
                qualifiedNext = next;
                break;
            }
        }

        return qualifiedNext;
    }

    protected checkCondition(condition: any): boolean {
        if (condition.hasOwnProperty("flag")) {
            return (globalState.flags.indexOf(condition.flag) >= 0);
        }
        else if (condition.hasOwnProperty("noflag"))
        {
            return !(globalState.flags.indexOf(condition.noflag) >= 0);
        }
        else if (condition.hasOwnProperty("variable")) {
            if (globalState.vars.hasOwnProperty(condition.variable))
                return this.checkVariable(condition, globalState.vars[condition.variable]);
            else return false;
        }
        else if (condition.hasOwnProperty("affinity")) {
            if (globalState.affinity.hasOwnProperty(condition.affinity))
                return this.checkVariable(condition, globalState.affinity[condition.affinity]);
            else return false;
        }
        else if (condition.hasOwnProperty("quest")) {
            if (condition.hasOwnProperty("started"))
            {
                let questStarted: boolean = false;
                if (globalState.quests.hasOwnProperty(condition.quest))
                    questStarted = (globalState.quests[condition.quest] > 0);

                if (condition.started == false)
                    questStarted = !questStarted;

                return questStarted;
            }
            else if (condition.hasOwnProperty("finished"))
            {
                let questFinished: boolean = false;
                if (globalState.quests.hasOwnProperty(condition.quest))
                    questFinished = (globalState.quests[condition.quest] < 0);

                if (condition.finished == false)
                    questFinished = !questFinished;

                return questFinished;
            }

            if (globalState.quests.hasOwnProperty(condition.quest))
                return this.checkVariable(condition, globalState.quests[condition.quest]);
            else return false;

        }
        else if (condition.hasOwnProperty("item")) {
            let itemIndex = globalState.inventory.indexOf(condition.item);
            if (itemIndex < 0)
                return false;
            else {
                if (condition.hasOwnProperty("consume") && condition.consume == true)
                    globalState.inventory.splice(itemIndex, 1);
                return true;
            }
        }
        else if (condition.hasOwnProperty("language"))
        {
            if (condition.language.toLowerCase() == "english")
                return GameLanguage.English == globalConfig.cinematicLanguage;
            else if (condition.language.toLowerCase() == "japanese")
                return GameLanguage.Japanese == globalConfig.cinematicLanguage;
            else
                return condition.language == globalConfig.cinematicLanguage; //fallback to a dumb int comparison
        }
        else if (condition.hasOwnProperty("adultcontent"))
        {
            return globalConfig.adultContent == condition.adultcontent;
        }
        else if (condition.hasOwnProperty("eval"))
        {
            return eval(condition.eval);
        }

        console.log("Invalid condition!");
        console.log(condition);
        return false;

        //TODO RPG elements
    }

    private checkVariable(condition: any, variable: number): boolean {
        if (condition.hasOwnProperty("greater")) {
            let testVal = condition.greater;
            return variable > testVal;
        }
        else if (condition.hasOwnProperty("less")) {
            let testVal = condition.less;
            return variable < testVal;
        }
        else if (condition.hasOwnProperty("greaterEqual")) {
            let testVal = condition.greaterEqual;
            return variable >= testVal;
        }
        else if (condition.hasOwnProperty("lessEqual")) {
            let testVal = condition.lessEqual;
            return variable <= testVal;
        }
        else if (condition.hasOwnProperty("equal")) {
            let testVal = condition.equal;
            return variable == testVal;
        }
        else if (condition.hasOwnProperty("notEqual")) {
            let testVal = condition.notEqual;
            return variable != testVal;
        }

        return false; //it's actually really important that this doesn't throw
    }

    //process microscript method
    protected resolveMicroscript(microscript: any): void {
        //sanity checks are performed in caller

        for (let i: number = 0; i < microscript.length; i++) {
            this.executeMicroscriptNode(microscript[i]);
        }
    }

    private executeMicroscriptNode(microscriptNode: any): void {
        if (microscriptNode.hasOwnProperty("flag")) {
            if (microscriptNode.hasOwnProperty("set")) {
                if (microscriptNode.set == true) {
                    if (globalState.flags.indexOf(microscriptNode.flag) < 0)
                        globalState.flags.push(microscriptNode.flag);
                }
                else {
                    if (globalState.flags.indexOf(microscriptNode.flag) >= 0)
                        globalState.flags.splice(globalState.flags.indexOf(microscriptNode.flag), 1);
                }

            }
            else if (microscriptNode.hasOwnProperty("toggle")) {
                if (globalState.flags.indexOf(microscriptNode.flag) >= 0)
                    globalState.flags.splice(globalState.flags.indexOf(microscriptNode.flag), 1);
                else
                    globalState.flags.push(microscriptNode.flag);
            }
            else {
                console.log("Microscript node is invalid!");
                console.log(microscriptNode);
            }
        }
        else if (microscriptNode.hasOwnProperty("item")) {
            if (microscriptNode.hasOwnProperty("give")) {
                for (let i: number = 0; i < microscriptNode.give; i++)
                    globalState.inventory.push(microscriptNode.item);
            }
            else if (microscriptNode.hasOwnProperty("take")) {
                if (globalState.inventory.indexOf(microscriptNode.item) >= 0)
                    globalState.inventory.splice(globalState.inventory.indexOf(microscriptNode.item), 1);
            }
            else {
                console.log("Microscript node is invalid!");
                console.log(microscriptNode);
            }
        }
        else if (microscriptNode.hasOwnProperty("variable")) {
            if (!globalState.vars.hasOwnProperty(microscriptNode.variable)) {
                globalState.vars[microscriptNode.variable] = 0;
            }

            if (microscriptNode.hasOwnProperty("set")) {
                globalState.vars[microscriptNode.variable] = microscriptNode.set;
            }
            else if (microscriptNode.hasOwnProperty("add")) {
                globalState.vars[microscriptNode.variable] = globalState.vars[microscriptNode.variable] + microscriptNode.add;
            }
            else {
                console.log("Microscript node is invalid!");
                console.log(microscriptNode);
            }
        }
        else if (microscriptNode.hasOwnProperty("affinity")) {
            if (!globalState.affinity.hasOwnProperty(microscriptNode.affinity)) {
                globalState.affinity[microscriptNode.affinity] = 0;
            }

            if (microscriptNode.hasOwnProperty("set")) {
                globalState.affinity[microscriptNode.affinity] = microscriptNode.set;
            }
            else if (microscriptNode.hasOwnProperty("add")) {
                globalState.affinity[microscriptNode.affinity] = globalState.affinity[microscriptNode.affinity] + microscriptNode.add;
            }
            else {
                console.log("Microscript node is invalid!");
                console.log(microscriptNode);
            }
        }
        else if (microscriptNode.hasOwnProperty("quest")) {
            if (!globalState.quests.hasOwnProperty(microscriptNode.quest)) {
                globalState.quests[microscriptNode.quest] = 0;
            }

            if (microscriptNode.hasOwnProperty("set")) {
                globalState.quests[microscriptNode.quest] = microscriptNode.set;
            }
            else if (microscriptNode.hasOwnProperty("add")) {
                globalState.quests[microscriptNode.quest] = globalState.quests[microscriptNode.quest] + microscriptNode.add;
            }
            else if (microscriptNode.hasOwnProperty("start")) {
                if (globalState.quests[microscriptNode.quest] == 0)
                    globalState.quests[microscriptNode.quest] = microscriptNode.start;
            }
            else if (microscriptNode.hasOwnProperty("finish")) {
                if (globalState.quests[microscriptNode.quest] > 0)
                    globalState.quests[microscriptNode.quest] = microscriptNode.finish;
            }
            else {
                console.log("Microscript node is invalid!");
                console.log(microscriptNode);
            }
        }
        else if (microscriptNode.hasOwnProperty("eval")) {
            eval(microscriptNode.eval);
        }
        else {
            console.log("Microscript node is invalid!");
            console.log(microscriptNode);
        }
        //TODO RPG elements
    }
}

const enum FrameImagePosition
{
    Center, Fill, Character, Battler
}

abstract class GameFrameController extends FrameController
{

    protected background: string;
    protected image: string;
    protected music: string;
    protected title: string;
    protected hideMenuBar: boolean;
    protected lockMenuBar: boolean;
    protected imagePosition: FrameImagePosition;

    protected nextMicroscript: any;
    protected nextConditional: any;

    constructor(scene: string, frame: string)
    {
        super();
        this._scene = scene;
        this._frame = frame;

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        //try to inherit background and music from scene
        if (sceneData.background)
            this.background = sceneData.background;
        if (sceneData.music)
            this.music = sceneData.music;
        this.hideMenuBar = false;
        if (sceneData.hasOwnProperty("hideMenuBar"))
            this.hideMenuBar = sceneData.hideMenuBar;
        this.lockMenuBar = false;
        if (sceneData.hasOwnProperty("lockMenuBar"))
            this.lockMenuBar = sceneData.lockMenuBar;
        if (sceneData.hasOwnProperty("title"))
            this.title = sceneData.title;

        //grab other properties from frame data if available
        if (frameData.background)
            this.background = frameData.background;
        if (frameData.music)
            this.music = frameData.music;
        if (frameData.hasOwnProperty("hideMenuBar"))
            this.hideMenuBar = frameData.hideMenuBar;
        if (frameData.hasOwnProperty("lockMenuBar"))
            this.lockMenuBar = frameData.lockMenuBar;
        if (frameData.hasOwnProperty("title"))
            this.title = frameData.title;

        //DO NOT parse imageposition; we want different defaults

        //...but we can, for the time being, parse image
        if (sceneData.hasOwnProperty("image"))
            this.image = sceneData.image;
        if (frameData.hasOwnProperty("image"))
            this.image = frameData.image;

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
        if (frameData.hasOwnProperty("nextConditional") && frameData.nextConditional.length > 0)
        {
            this.nextConditional = frameData.nextConditional; //we will interpret on execute
        }

        //get microscripts if exists
        if (frameData.hasOwnProperty("nextMicroscript"))
        {
            this.nextMicroscript = frameData.nextMicroscript;
        }
        
    }

    present(): void
    {
        //set background and music
        globalEngine.drawBackground(this.background);
        globalEngine.menuBarEnabled = !this.hideMenuBar;
        globalSoundManager.playMusic(this.music);
    }

    static parsePosition(posName: string): FrameImagePosition
    {
        if (posName.toLowerCase() == "center")
            return FrameImagePosition.Center;
        if (posName.toLowerCase() == "fill")
            return FrameImagePosition.Fill;
        if (posName.toLowerCase() == "character")
            return FrameImagePosition.Character;
        if (posName.toLowerCase() == "battler")
            return FrameImagePosition.Battler;

        throw null;
    }

    protected paintImage(image: string, pos: FrameImagePosition): void
    {
        try
        {
            let imageEl = $(document.createElement("img"));
            imageEl.attr("src", globalImageManager.getImage(image).src);
            if (pos == FrameImagePosition.Character)
                imageEl.addClass("charFrameImage");
            else if (pos == FrameImagePosition.Fill)
                imageEl.addClass("fillFrameImage");
            else if (pos == FrameImagePosition.Battler)
                imageEl.addClass("battlerFrameImage");
            else
                imageEl.addClass("imageFrameImage");
            $(globalEngine.rootNode).append(imageEl);
        }
        catch (e)
        {
            console.log(e);
        }
    }

    protected gotoNext(evt?: any): void
    {
        if (this.nextMicroscript)
        {
            this.resolveMicroscript(this.nextMicroscript);
        }

        if (this.nextConditional)
        {
            let next = this.resolveConditional(this.nextConditional);

            let nextScene: string = null;
            let nextFrame: string = null;

            let loc = next.split(".");
            nextScene = loc[0];
            if (loc.length > 1)
                nextFrame = loc[1];

            globalEngine.changeFrame(nextScene, nextFrame);
        }
        else
        {
            if ((!this.nextScene || !this.nextFrame))
                console.log("Missing nextScene and/or nextFrame!");

            globalEngine.changeFrame(this.nextScene, this.nextFrame);
        }

        
    }

    protected gotoNextDirect(nextScene: string, nextFrame: string)
    {        
        globalEngine.changeFrame(nextScene, nextFrame); //just go, do not resolve conditionals or exec microscripts
    }

    protected gotoNextDirectEx(next: string)
    {
        let nextScene: string = null;
        let nextFrame: string = null;

        let loc = next.split(".");
        nextScene = loc[0];
        if (loc.length > 1)
            nextFrame = loc[1];

        globalEngine.changeFrame(nextScene, nextFrame);
    }

    protected gotoNextSpecific(nextScene: string, nextFrame: string, microscript?: any)
    {
        if (microscript)
        {
            this.resolveMicroscript(microscript);
        }
        globalEngine.changeFrame(nextScene, nextFrame); //but do not resolve any conditionals
    }

    protected gotoNextConditional(conditional: any, microscript?: any)
    {
        //exec microscript, resolve conditional, go
        if (microscript)
        {
            this.resolveMicroscript(microscript);
        }

        if (conditional)
        {
            let next = this.resolveConditional(conditional);

            let nextScene: string = null;
            let nextFrame: string = null;

            let loc = next.split(".");
            nextScene = loc[0];
            if (loc.length > 1)
                nextFrame = loc[1];

            globalEngine.changeFrame(nextScene, nextFrame);
        }
        else
        {
            console.log("No/invalid conditional!");
            throw null;
        }
    }
}
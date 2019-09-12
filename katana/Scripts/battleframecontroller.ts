/// <reference path="framecontroller.ts" />

const enum PlayerAction
{
    None, Attack, Block, Run //TODO heal
}

class BattleFrameController extends GameFrameController
{
    protected healOnStart: boolean;
    protected healOnExit: boolean;
    protected canEscape: boolean;
    protected enemy: any;

    protected escapeNextMicroscript: any;
    protected escapeNextConditional: any;
    protected escapeNextScene: string;
    protected escapeNextFrame: string;

    protected loseNextMicroscript: any;
    protected loseNextConditional: any;
    protected loseNextScene: string;
    protected loseNextFrame: string;

    protected elPlayerHP: HTMLElement;
    protected elEnemyHP: HTMLElement;
    protected elPlayerStatus: HTMLElement;
    protected elEnemyStatus: HTMLElement;
    protected elButtonContainer: HTMLElement;

    protected enemyHP: number;
    protected playerAttack: number;
    protected playerDefence: number;
    protected playerAction: PlayerAction;

    constructor(scene: string, frame: string)
    {
        super(scene, frame);

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        //handle battler data
        if (frameData.hasOwnProperty("enemy"))
        {
            this.enemy = Object.assign({}, frameData.enemy);
        }
        else
        {
            console.log("Battle has no enemy data!");
        }

        //handle image override
        if (this.enemy && this.enemy.hasOwnProperty("image"))
            this.image = this.enemy.image;

        //handle image position
        this.imagePosition = FrameImagePosition.Battler;

        //handle battle vars
        if (frameData.hasOwnProperty("healOnStart"))
            this.healOnStart = frameData.healOnStart;
        if (frameData.hasOwnProperty("healOnExit"))
            this.healOnExit = frameData.healOnExit;
        if (frameData.hasOwnProperty("canEscape"))
            this.canEscape = frameData.canEscape;

        //get normal next if exists (inherited)

        //handle escapeNext
        if (frameData.hasOwnProperty("escapeNext"))
        {
            let loc = frameData.escapeNext.split(".");
            this.escapeNextScene = loc[0];
            if (loc.length > 1)
                this.escapeNextFrame = loc[1];
            else
                this.escapeNextFrame = null;
        }
        if (frameData.hasOwnProperty("escapeNextConditional") && frameData.escapeNextConditional.length > 0)
        {
            this.escapeNextConditional = frameData.escapeNextConditional; //we will interpret on execute
        }
        if (frameData.hasOwnProperty("escapeNextMicroscript"))
        {
            this.escapeNextMicroscript = frameData.escapeNextMicroscript;
        }

        //handle loseNext
        if (frameData.hasOwnProperty("loseNext"))
        {
            let loc = frameData.loseNext.split(".");
            this.loseNextScene = loc[0];
            if (loc.length > 1)
                this.loseNextFrame = loc[1];
            else
                this.loseNextFrame = null;
        }
        if (frameData.hasOwnProperty("loseNextConditional") && frameData.loseNextConditional.length > 0)
        {
            this.loseNextConditional = frameData.loseNextConditional; //we will interpret on execute
        }
        if (frameData.hasOwnProperty("loseNextMicroscript"))
        {
            this.loseNextMicroscript = frameData.loseNextMicroscript;
        }

        //begin battle (apply start heal, etc)
        this.startBattle();
    }

    present(): void
    {
        super.present();

        //paint battler
        //TODO position overrides
        this.paintImage(this.image, this.imagePosition);

        let rootEl = $(globalEngine.rootNode);

        //paint battler title
        let enemyName: string;
        if (this.enemy.name)
            enemyName = this.enemy.name;
        rootEl.append($("<h1>").addClass("battleTitle").text(enemyName));

        //paint battler HP box
        this.elEnemyHP = $("<h1>").addClass("battleTitleHP").text(this.enemyHP + " HP").get(0);
        rootEl.append(this.elEnemyHP);

        //paint status text boxes
        this.elPlayerStatus = $("<p>").addClass("battlePlayerStatus").text("Player").get(0);
        rootEl.append(this.elPlayerStatus);
        this.elEnemyStatus = $("<p>").addClass("battleEnemyStatus").text("Enemy").get(0);
        rootEl.append(this.elEnemyStatus);

        //paint player HP box
        this.elPlayerHP = $("<p>").addClass("battlePlayerHP").text("Player HP: " + globalState.playerHP).get(0);
        rootEl.append(this.elPlayerHP);

        //paint buttons
        this.elButtonContainer = $("<div>").addClass("battleButtonContainer").get(0);
        rootEl.append(this.elButtonContainer);
        this.paintButtons();
    }

    private paintButtons(): void
    {
        $(this.elButtonContainer).append($("<button>").on("click", () => this.onClickAttack()).text("Attack"));
        $(this.elButtonContainer).append($("<button>").on("click", () => this.onClickBlock()).text("Block"));
        $(this.elButtonContainer).append($("<button>").on("click", () => this.onClickRun()).text("Run"));
    }

    private onClickAttack(): void
    {
        this.playerAction = PlayerAction.Attack;
        this.advanceTurn();
    }

    private onClickBlock(): void
    {
        this.playerAction = PlayerAction.Block;
        this.advanceTurn();
    }

    private onClickRun(): void
    {
        this.playerAction = PlayerAction.Run;
        this.advanceTurn();
    }

    private startBattle(): void
    {
        if (this.healOnStart)
            globalState.playerHP = globalState.calcMaxHP();

        this.enemyHP = this.enemy.hp;

        this.playerAttack = globalState.calcPlayerAttack();
        this.playerDefence = globalState.calcPlayerDefence();
    }

    private advanceTurn(): void
    {
        console.log("advance turn!");

        //clear status windows
        $(this.elButtonContainer).empty();
        $(this.elEnemyStatus).empty();
        $(this.elPlayerStatus).empty();

        //TODO: async and animation

        //execute player turn
        let playerSucceeded = this.executePlayerTurn();
        if (!playerSucceeded)
        {
            //player must have run (TODO may need to change this)

            //paint status, paint continue button
            $(this.elButtonContainer).empty();
            $(this.elButtonContainer).append($("<button>").on("click", () => this.continueEscape()).text("Continue"));
            return;
        }

        //execute enemy turn
        if (this.enemyHP > 0)
            this.executeEnemyTurn();   

        //check if player dead, enemy dead, paint appropriate continue button
        if (globalState.playerHP <= 0)
        {
            //player dead
            $(this.elButtonContainer).append($("<button>").on("click", () => this.continueLose()).text("Continue"));
        }
        else if (this.enemyHP <= 0)
        {
            //enemy dead
            $(this.elButtonContainer).append($("<button>").on("click", () => this.continueWin()).text("Continue"));
        }
        else
        {
            //battle continue
            this.paintButtons();
        }

    }

    private executePlayerTurn(): boolean
    {


        // special handling for run
        if (this.playerAction == PlayerAction.Run)
        {
            //flip a coin
            if (Math.random() >= 0.5)
            {
                //successfully ran away
                $(this.elPlayerStatus).empty().text("You escaped!");
                return false;
            }
            $(this.elPlayerStatus).empty().text("Couldn't escape!");
            return true;
        }

        //special handling for block
        if (this.playerAction == PlayerAction.Block)
        {
            $(this.elPlayerStatus).empty().text("You block!");
            return true;
        }

        //apply player damage to enemy
        //TODO miss and crit chance
        let baseAttack = Math.round(this.playerAttack + (Math.random() * 0.5 * this.playerAttack));
        let clampedAttack = baseAttack - this.enemy.defence;
        if (clampedAttack < 0)
            clampedAttack = 0;
        this.enemyHP -= clampedAttack;
        
        //paint player attack results and update HP
        let statusString = "You attack! (" + clampedAttack + " damage)";
        $(this.elPlayerStatus).empty().text(statusString);
        $(this.elEnemyHP).empty().text("HP: " + this.enemyHP);

        //handle enemy dead
        if (this.enemyHP <= 0)
        {
            let text = $(this.elPlayerStatus).text();
            text += " <br>Killed enemy!";
            $(this.elPlayerStatus).empty().html(text);
        }

        this.playerAction = PlayerAction.None;

        return true;
    }

    private executeEnemyTurn(): void
    {

        //apply enemy damage to player
        //TODO miss and crit chance
        let baseAttack = Math.round(this.enemy.attack + (Math.random() * 0.5 * this.enemy.attack));
        let clampedAttack = baseAttack - this.playerDefence;
        if (this.playerAction == PlayerAction.Block)
        {
            clampedAttack -= this.playerDefence;
        }
        if (clampedAttack < 0)
            clampedAttack = 0;
        globalState.playerHP -= clampedAttack;

        //paint enemy attack result and update HP
        let statusString = "Enemy attack! (" + clampedAttack + " damage)";
        $(this.elEnemyStatus).empty().text(statusString);
        $(this.elPlayerHP).text("Player HP: " + globalState.playerHP);

        //check if player dead
        if (globalState.playerHP <= 0)
        {
            let text = $(this.elEnemyStatus).text();
            text += " <br>Killed player!";
            $(this.elEnemyStatus).empty().html(text);
        }

    }

    private continueEscape(): void
    {
        //TODO apply heal?

        //execute microscript if available
        if (this.escapeNextMicroscript)
            this.resolveMicroscript(this.escapeNextMicroscript);

        //if escapeNext is available, use that
        if (this.escapeNextConditional)
        {
            this.gotoNextConditional(this.escapeNextConditional);
        }
        else if (this.escapeNextScene)
        {
            this.gotoNextDirect(this.escapeNextScene, this.escapeNextFrame);
        }
        //if not, continue as win
        else if (this.nextConditional)
        {
            this.gotoNextConditional(this.nextConditional);            
        }
        else
        {
            this.gotoNextDirect(this.nextScene, this.nextFrame);
        }
        
    }

    private continueWin(): void
    {
        //apply heal
        if (this.healOnExit)
            globalState.playerHP = globalState.calcMaxHP();
        
        //apply XP
        if (this.enemy.xp) //move out of enemy and to battle data?
            globalState.playerXP += this.enemy.xp;

        //trigger levelup
        globalState.checkLevelUp();

        this.gotoNext();
    }

    private continueLose(): void
    {
        //execute microscript if available
        if (this.loseNextMicroscript)
            this.resolveMicroscript(this.escapeNextMicroscript);

        //if loseNext is available, use that
        if (this.escapeNextConditional)
        {
            this.gotoNextConditional(this.escapeNextConditional);
        }
        else if (this.escapeNextScene)
        {
            this.gotoNextDirect(this.escapeNextScene, this.escapeNextFrame);
        }
        //else end game
        else
        {
            this.gotoNextDirect("meta", "end");
        }
        

    }
}
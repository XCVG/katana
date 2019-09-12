//an attempt was made at typed POD
class GameState
{
    //TODO should probably move these to defs
    public static readonly baseHP = 100;
    public static readonly baseXP = 30;
    public static readonly levelHPFactor = 10;
    public static readonly levelXPFactor = 10;

    flags: Array<any>;
    vars: Object;
    quests: Object;
    affinity: Object;

    day: number;
    location: string;

    playerHP: number;
    playerXP: number;
    playerLevel: number;
    playerMoney: number;
    inventory: Array<string>;

    constructor()
    {
        this.flags = new Array<any>();
        this.vars = new Object();
        this.quests = new Object();
        this.affinity = new Object();

        //TODO setup some defaults

        this.day = 0;
        this.location = "";

        this.playerHP = GameState.baseHP;
        this.playerXP = 0;
        this.playerLevel = 0;
        this.playerMoney = 0;
        this.inventory = new Array<string>();
    }

    //this implementation is very bad
    static deserialize(data: string): GameState
    {
        //deserialize to intermediate object
        let obj = JSON.parse(data);

        let gsobj = new GameState();

        //force data into holes
        gsobj.flags = obj.flags;
        gsobj.vars = obj.vars;
        gsobj.quests = obj.quests;
        gsobj.affinity = obj.affinity;
        gsobj.day = obj.day;
        gsobj.location = obj.location;
        gsobj.playerHP = obj.playerHP;
        gsobj.playerXP = obj.playerXP;
        gsobj.playerLevel = obj.playerLevel;
        gsobj.playerMoney = obj.playerMoney;
        gsobj.inventory = obj.inventory;

        return gsobj;
    }

    static serialize(state: GameState): string
    {
        return JSON.stringify(state);
    }

    calcPlayerAttack(): number
    {
        let maxAttack = 0;

        for (let i = 0; i < this.inventory.length; i++)
        {
            let iStr = this.inventory[i];
            if (globalData.defs.inventory.hasOwnProperty(iStr))
            {
                let iDef = globalData.defs.inventory[iStr];
                if (iDef.hasOwnProperty("attack"))
                {
                    let iAttack = <number>iDef.attack;
                    if (iAttack > maxAttack)
                        maxAttack = iAttack;
                }
            }
        }

        return maxAttack + this.playerLevel;
    }

    calcPlayerDefence(): number
    {
        let maxDefence = 0;

        for (let i = 0; i < this.inventory.length; i++)
        {
            let iStr = this.inventory[i];
            if (globalData.defs.inventory.hasOwnProperty(iStr))
            {
                let iDef = globalData.defs.inventory[iStr]
                if (iDef.hasOwnProperty("defence"))
                {
                    let iDefence = <number>iDef.defence;
                    if (iDefence > maxDefence)
                        maxDefence = iDefence;
                }
            }
        }

        return maxDefence + this.playerLevel;
    }

    calcMaxHP(): number
    {
        return GameState.baseHP + GameState.levelHPFactor * this.playerLevel;
    }

    calcXPToNext(): number
    {
        return GameState.baseXP + GameState.levelXPFactor * this.playerLevel;
    }

    checkLevelUp(): void
    {
        let xpToNext = this.calcXPToNext();
        if (this.playerXP >= xpToNext)
        {
            this.playerXP -= xpToNext;
            this.playerLevel++;

            //TODO nicer alert and a sound

            let alertString = "Welcome to level " + this.playerLevel;
            alert(alertString);
        }
    }
}
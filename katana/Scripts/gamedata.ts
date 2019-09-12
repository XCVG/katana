class GameData
{
    scenes: any;
    defs: any;
    initial: string;

    private chunksToLoad: number;
    private chunksLoaded: number;

    constructor()
    {
        this.scenes = new Object();
        this.defs = new Object();

        this.chunksToLoad = 0;
        this.chunksLoaded = 0;
    }

    load()
    {
        //odd ordering is to avoid getting fucked by async (we might be)

        this.chunksToLoad++; //main scenes file
        this.chunksToLoad++; //defs file
        this.chunksToLoad++; //initial state file

        //scan for additional scenes
        let fileNamesScene: Array<string> = fs.readdirSync("Assets/scenes"); //this works
        console.log("All additional scenes");
        console.log(fileNamesScene);
        this.chunksToLoad += fileNamesScene.length; //and add them to chunksToLoad

        //load main scenes file
        fs.readFile("Assets/data/scenes.json", "utf-8", (err, data) => this.onScenesLoadDone(err, data));
        
        //load individual scenes        
        for (let i: number = 0; i < fileNamesScene.length; i++)
        {
            let fileName: string = "Assets/scenes/" + fileNamesScene[i];
            let sceneName: string = fileNamesScene[i].split(".")[0];
            fs.readFile(fileName, "utf-8", (err, data) => this.onSingleSceneLoadDone(err, data, sceneName));      
        }

        //load defs
        fs.readFile("Assets/data/defs.json", "utf-8", (err, data) => this.onDefsLoadDone(err, data));
        
        //load initial
        fs.readFile("Assets/data/initial.json", "utf-8", (err, data) => this.onInitialLoadDone(err, data));
        
    }

    private onSingleSceneLoadDone(err: any, data: any, name: string): void
    {
        if (err)
        {
            console.log(err);
        }

        let scene = JSON.parse(data);

        this.scenes[name] = scene;

        this.chunksLoaded++;
        this.checkAllLoadDone();
    }

    private onScenesLoadDone(err: any, data: any): void
    {
        if (err)
        {
            console.log(err);
        }

        let newScenes = JSON.parse(data);
        for(let key in newScenes)
        {
            this.scenes[key] = newScenes[key];
        }

        this.chunksLoaded++;
        this.checkAllLoadDone();
    }

    private onDefsLoadDone(err: any, data: any): void
    {
        if (err)
        {
            console.log(err);
        }

        this.defs = JSON.parse(data);

        this.chunksLoaded++;
        this.checkAllLoadDone();
    }

    private onInitialLoadDone(err: any, data: any): void
    {
        if (err)
        {
            console.log(err);
        }

        this.initial = data;
        this.chunksLoaded++;
        this.checkAllLoadDone();
    }

    private checkAllLoadDone(): void
    {
        console.log("Data: " + this.chunksLoaded + "/" + this.chunksToLoad);

        if (this.chunksLoaded == this.chunksToLoad)
        {
            this.onAllLoadDone();
        }
    }

    private onAllLoadDone(): void
    {
        console.log("GameData done!");
        console.log(this.scenes);
        signalModuleLoadDone();
    }

}
enum GameLanguage
{
    English, Japanese
}

class ConfigState
{
    soundVolume: number;
    musicVolume: number;
    useAutosave: boolean;
    adultContent: boolean;
    cinematicLanguage: GameLanguage;

    private get configPath(): string
    {
        return process.env.APPDATA + "/" + gameDataFolder + "config.json";
    }

    constructor()
    {
        this.useAutosave = true;
        this.cinematicLanguage = GameLanguage.English;
        this.adultContent = true;
        this.soundVolume = 0.8;
        this.musicVolume = 0.8;
    }

    load()
    {
        if (fs.existsSync(this.configPath))
        {
            fs.readFile(this.configPath, "utf-8", (err, data) => this.onLoadDone(err, data));
        }            
        else
        {
            ensureDirectoryExistence(this.configPath);
            fs.writeFileSync(this.configPath, JSON.stringify(this));

            console.log("Config doesn't exist, creating new one!");
            console.log(JSON.stringify(this));
            signalModuleLoadDone();
        }
            
    }

    private onLoadDone(err: any, data: any): void
    {
        if (err)
        {
            console.log(err);
        }

        let obj = JSON.parse(data);

        this.cinematicLanguage = obj.cinematicLanguage;
        this.useAutosave = obj.useAutosave;
        this.soundVolume = obj.soundVolume;
        this.musicVolume = obj.musicVolume;

        console.log("Config loaded!");
        console.log(JSON.stringify(this));
        signalModuleLoadDone();
    }

    save()
    {
        fs.writeFileSync(this.configPath, JSON.stringify(this));
        console.log("Config saved!");
    }
}
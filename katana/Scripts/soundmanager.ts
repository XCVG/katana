class SoundManager
{
    private sounds: object;
    private musics: object;

    private sfxToLoad: number;
    private sfxLoaded: number;
    private musToLoad: number;
    private musLoaded: number;

    private currentMus: string;

    constructor()
    {
        this.sounds = new Object();
        this.musics = new Object();

        this.sfxToLoad = 0;
        this.sfxLoaded = 0;
        this.musToLoad = 0;
        this.musLoaded = 0;
    }

    setVolume(): void
    {
        if (this.currentMus)
        {
            let mObj: HTMLAudioElement = this.musics[this.currentMus];
            mObj.volume = globalConfig.musicVolume;
        }

    }

    playMusic(music: string, loop: boolean = true): void
    {
        if (this.currentMus && music == this.currentMus)
        {
            let mObj: HTMLAudioElement = this.musics[this.currentMus];
            if (mObj.loop != loop)
            {
                mObj.loop = loop;
            }
            if (mObj.ended && loop)
            {
                mObj.volume = globalConfig.musicVolume;
                mObj.currentTime = 0;
                mObj.play();
            }
                
        }
        else
        {
            this.stopMusic();

            if (!this.musics.hasOwnProperty(music))
            {
                this.currentMus = null;
                console.log("Music " + music + " not found!");
                return;
            }

            this.currentMus = music;
            let mObj: HTMLAudioElement = this.musics[this.currentMus];
            mObj.volume = globalConfig.musicVolume;
            mObj.currentTime = 0;
            mObj.loop = loop;
            mObj.play();
        }
    }

    stopMusic(): void
    {
        if (this.currentMus)
        {
            let mObj: HTMLAudioElement = this.musics[this.currentMus];
            mObj.pause();
            mObj.currentTime = 0;
            mObj.loop = false;
            this.currentMus = null;
        }

    }

    playSound(sound: string)
    {
        if (!this.sounds.hasOwnProperty(sound))
        {
            console.log("Sound " + sound + " not found!");
            return;
        }

        let sObj: HTMLAudioElement = this.sounds[sound];
        sObj.volume = globalConfig.soundVolume;
        sObj.currentTime = 0;
        sObj.play();
    }

    load(): void
    {
        let fileNamesSfx: Array<string> = fs.readdirSync("Assets/sfx");
        console.log("All sound files");
        console.log(fileNamesSfx);

        for (let i: number = 0; i < fileNamesSfx.length; i++)
        {
            let newSfxFileName: string = fileNamesSfx[i];
            let newSfxName: string = newSfxFileName.split(".")[0];
            let newSfx: HTMLAudioElement = new Audio();
            newSfx.src = "Assets/sfx/" + newSfxFileName;            
            //newSfx.addEventListener("canplaythrough", (evt) => this.onOneLoadDone(evt)); //possible race condition?
            $(newSfx).on("canplaythrough", (evt) => this.onOneLoadDone(evt));
            this.sfxToLoad++;
            newSfx.load();
            this.sounds[newSfxName] = newSfx;
        }

        let fileNamesMus: Array<string> = fs.readdirSync("Assets/mus");
        console.log(fileNamesMus);

        for (let i: number = 0; i < fileNamesMus.length; i++)
        {
            let newMusFileName: string = fileNamesMus[i];
            let newMusName: string = newMusFileName.split(".")[0];
            let newMus: HTMLAudioElement = new Audio();
            newMus.src = "Assets/mus/" + newMusFileName;
            //newMus.addEventListener("canplaythrough", (evt) => this.onMusLoadDone(evt)); //possible race condition?
            $(newMus).on("canplaythrough", (evt) => this.onMusLoadDone(evt));
            this.musToLoad++;
            newMus.load();
            this.musics[newMusName] = newMus;
        }

        //console.log("Sfx: " + this.SfxLoaded + "/" + this.SfxToLoad + " | " + "Mus: " + this.MusLoaded + "/" + this.MusToLoad);

        this.checkAllLoadDone();
        
    }

    private onOneLoadDone(evt: any): void
    {
        $(evt.currentTarget).off("canplaythrough");
        this.sfxLoaded++;
        this.checkAllLoadDone();
    }

    private onMusLoadDone(evt: any): void
    {
        $(evt.currentTarget).off("canplaythrough");
        this.musLoaded++;
        this.checkAllLoadDone();
    }

    private checkAllLoadDone(): void
    {
        console.log("Sfx: " + this.sfxLoaded + "/" + this.sfxToLoad + " | " + "Mus: " + this.musLoaded + "/" + this.musToLoad);
        if (this.sfxLoaded == this.sfxToLoad && this.musLoaded == this.musToLoad)
        {
            this.onAllLoadDone();
        }
    }

    private onAllLoadDone(): void
    {
        console.log("SoundManager done!");
        console.log(this.sounds);
        console.log(this.musics);
        signalModuleLoadDone();
    }

    

}
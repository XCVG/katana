class ImageManager
{
    private charImages: object;
    private uiImages: object;
    private bgImages: object;

    private imagesToLoad: number;
    private imagesLoaded: number;

    constructor()
    {
        this.charImages = new Object();
        this.uiImages = new Object();
        this.bgImages = new Object();

        this.imagesToLoad = 0;
        this.imagesLoaded = 0;
    }

    //gets an image, searching char then ui then bg
    getImage(image: string): HTMLImageElement
    {
        if (this.charImages.hasOwnProperty(image))
        {
            return this.charImages[image];
        }

        if (this.uiImages.hasOwnProperty(image))
        {
            return this.uiImages[image];
        }

        if (this.bgImages.hasOwnProperty(image))
        {
            return this.bgImages[image];
        }

        return null;
    }

    getCharImage(image: string): HTMLImageElement
    {
        if (this.charImages.hasOwnProperty(image))
        {
            return this.charImages[image];
        }

        return null;
    }

    getUiImage(image: string): HTMLImageElement
    {
        if (this.uiImages.hasOwnProperty(image))
        {
            return this.uiImages[image];
        }

        return null;
    }

    getBgImage(image: string): HTMLImageElement
    {
        if (this.bgImages.hasOwnProperty(image))
        {
            return this.bgImages[image];
        }

        return null;
    }

    load(): void
    {
        let fileNamesChar: Array<string> = fs.readdirSync("Assets/char");
        console.log("All char images");
        console.log(fileNamesChar);

        for (let i: number = 0; i < fileNamesChar.length; i++)
        {
            let fileName: string = fileNamesChar[i];
            let imageName: string = fileName.split(".")[0];
            let image: HTMLImageElement = new Image();
            image.src = "Assets/char/" + fileName;
            $(image).on("load", (evt) => this.onOneLoadDone(evt));
            this.imagesToLoad++;
            this.charImages[imageName] = image;
        }

        let fileNamesUi: Array<string> = fs.readdirSync("Assets/ui");
        console.log("All ui images");
        console.log(fileNamesUi);

        for (let i: number = 0; i < fileNamesUi.length; i++)
        {
            let fileName: string = fileNamesUi[i];
            let imageName: string = fileName.split(".")[0];
            let image: HTMLImageElement = new Image();
            image.src = "Assets/ui/" + fileName;
            $(image).on("load", (evt) => this.onOneLoadDone(evt));
            this.imagesToLoad++;
            this.uiImages[imageName] = image;
        }

        let fileNamesBg: Array<string> = fs.readdirSync("Assets/bg");
        console.log("All bg images");
        console.log(fileNamesBg);

        for (let i: number = 0; i < fileNamesBg.length; i++)
        {
            let fileName: string = fileNamesBg[i];
            let imageName: string = fileName.split(".")[0];
            let image: HTMLImageElement = new Image();
            image.src = "Assets/bg/" + fileName;
            $(image).on("load", (evt) => this.onOneLoadDone(evt));
            this.imagesToLoad++;
            this.bgImages[imageName] = image;
        }

        this.checkAllLoadDone();
    }

    private onOneLoadDone(evt: any): void
    {
        $(evt.currentTarget).off("load");
        this.imagesLoaded++;
        this.checkAllLoadDone();
    }

    private checkAllLoadDone(): void
    {
        console.log("Images: " + this.imagesLoaded + "/" + this.imagesToLoad);
        if (this.imagesLoaded == this.imagesToLoad)
        {
            this.onAllLoadDone();
        }
    }

    private onAllLoadDone(): void
    {
        console.log("ImageManager done!");
        console.log(this.charImages);
        console.log(this.uiImages);
        console.log(this.bgImages);
        signalModuleLoadDone();
    }
}
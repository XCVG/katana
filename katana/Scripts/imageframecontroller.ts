class ImageFrameController extends GameFrameController
{

    private allowSkip: boolean;
    private hideSkip: boolean;
    private useTimer: boolean;
    private timeToShow: number;

    private timer: any;

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

        //defaults and overrides
        this.allowSkip = true;
        this.hideSkip = false;
        this.useTimer = false;
        this.timeToShow = 0;

        if (frameData.hasOwnProperty("allowSkip"))
            this.allowSkip = frameData.allowSkip;
        if (frameData.hasOwnProperty("hideSkip"))
            this.hideSkip = frameData.hideSkip;
        if (frameData.hasOwnProperty("useTimer") && frameData.useTimer)
        {
            this.useTimer = true;
            this.timeToShow = frameData.timeToShow;
        }

    }

    present(): void
    {
        super.present();

        //paint image
        this.paintImage(this.image, this.imagePosition);

        //set timeout if applicable
        if (this.useTimer)
        {
            this.timer = setTimeout(() => this.onContinue(), (this.timeToShow * 1000));
        }

        //display continue button if applicable
        if (this.allowSkip)
        {
            let buttonEl = $(document.createElement("button"));
            buttonEl.addClass("imageFrameButton");
            buttonEl.text("Next");
            buttonEl.on("click", () => this.onContinue());
            $(globalEngine.rootNode).append(buttonEl);
            //yes, hideskip does nothing right now
        }
    }

    onContinue(evt?: any)
    {
        clearTimeout(this.timer);
        //console.log("Continuing!");
        //console.log(this);
        this.gotoNext(evt);
    }
    
}
/// <reference path="framecontroller.ts" />

class VideoFrameController extends GameFrameController
{
    private allowSkip: boolean;
    private loop: boolean;
    private autoContinue: boolean;

    private timer: any;

    private video: string;
    private videoEl: HTMLVideoElement;

    constructor(scene: string, frame: string)
    {
        super(scene, frame);

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        this.video = frameData.video;

        //defaults and overrides
        this.allowSkip = true;
        this.loop = false;
        this.autoContinue = true;
        
        //I feel like all this marshalling is defeating half the purpose of using JS
        if (frameData.hasOwnProperty("allowSkip"))
            this.allowSkip = frameData.allowSkip;

        if (frameData.hasOwnProperty("autoContinue"))
            this.autoContinue = frameData.autoContinue;

        if (frameData.hasOwnProperty("loop"))
            this.loop = frameData.loop;

        this.imagePosition = FrameImagePosition.Center;
        if (frameData.hasOwnProperty("position"))
        {
            this.imagePosition = GameFrameController.parsePosition(frameData.position);
        }

    }

    present(): void
    {
        super.present();

        //paint video
        let videoEl = document.createElement("video");
        globalEngine.rootNode.appendChild(videoEl);
        this.videoEl = videoEl;

        if (this.imagePosition == FrameImagePosition.Fill)
            $(videoEl).addClass("fillFrameVideo"); //I cannot resist the JQUEERYS
        else
            $(videoEl).addClass("videoFrameVideo");

        videoEl.controls = false;

        //set source
        //TODO fallback language?
        videoEl.src = "Assets/video/" + GameLanguage[globalConfig.cinematicLanguage] + "/" + this.video + ".webm"; //no webm support? fuck you!

        videoEl.volume = globalConfig.soundVolume;

        //display continue button if applicable
        if (this.allowSkip)
        {
            let buttonEl = $(document.createElement("button"));
            buttonEl.addClass("videoFrameButton");
            buttonEl.text("Next");
            buttonEl.on("click", () => this.onContinue());
            $(globalEngine.rootNode).append(buttonEl);
        }

        //set handlers
        if (this.loop)
        {
            videoEl.loop = true;
        }
        else if (this.autoContinue)
        {
            videoEl.onended = () => this.onContinue(); //kosher?
        }

        //play video
        videoEl.play();
    }

    onContinue(evt?: any)
    {
        this.gotoNext(evt);
    }
}
/// <reference path="framecontroller.ts" />

class AreaFrameController extends GameFrameController
{
    private hotspots: any[];

    private locationTitleEl: JQuery;

    constructor(scene: string, frame: string)
    {
        super(scene, frame);

        let sceneData = globalData.scenes[scene];
        let frameData = sceneData.frames[frame];

        //get hotspots
        this.hotspots = frameData.hotspots;
    }

    present(): void
    {
        super.present();

        //create title element
        this.locationTitleEl = $(document.createElement("div")).addClass("areaTitle");
        $(globalEngine.rootNode).append(this.locationTitleEl);

        //iterate through hotspots
        for (let i: number = 0; i < this.hotspots.length; i++)
        {
            let hotspot = this.hotspots[i];

            //if showCondition exists, check it and reject if needed
            if (hotspot.hasOwnProperty("showCondition") && hotspot.showCondition)
            {
                if (!this.checkCondition(hotspot.showCondition))
                    continue;
            }

            //hideCondition is the opposite of showCondition, note that it overrides it
            if (hotspot.hasOwnProperty("hideCondition") && hotspot.hideCondition)
            {
                if (this.checkCondition(hotspot.hideCondition))
                    continue;
            }

            //create hotspot element
            let hotspotEl = $(document.createElement("div")).addClass("areaHotspot");

            //set position
            hotspotEl.css("left", hotspot.x).css("top", hotspot.y);

            //if image is available, insert image
            let imageEl = null;
            if (hotspot.hasOwnProperty("image"))
            {
                try
                {
                    let image = hotspot.image;
                    imageEl = $(document.createElement("img"));
                    imageEl.attr("src", globalImageManager.getUiImage(image).src);
                    hotspotEl.append(imageEl);                    
                }
                catch (e)
                {
                    console.log(e);
                }
            }

            //if width/height is available, force width/height
            if (hotspot.hasOwnProperty("width") && hotspot.hasOwnProperty("height"))
            {
                hotspotEl.css("width", (hotspot.width + "px")).css("height", (hotspot.height + "px"));
                if(imageEl)
                    imageEl.css("width", "100%").css("height", "100%");
            }
            //if not, reset to use image
            else if (imageEl)
            {
                //TODO do we need to do anything here at all?              
            }
            else
            {
                console.log("Hotspot has invalid sizing!");
                console.log(hotspot);
            }

            //bind event handlers
            hotspotEl.on("click", (evt) => this.onClickHotspot(evt, i));
            hotspotEl.on("mouseover", (evt) => this.onEnterHotspot(evt, i));
            hotspotEl.on("mouseout", (evt) => this.onExitHotspot(evt, i));

            //enable highlighting
            if (hotspot.hasOwnProperty("highlight") && hotspot.highlight)
            {
                hotspotEl.addClass("areaHotspotHighlightable");
            }

            //we should probably actually draw it huh
            $(globalEngine.rootNode).append(hotspotEl);
        }
    }

    onEnterHotspot(evt: any, id: number): void
    {
        let hotspot = this.hotspots[id];

        //swap image if swapimage is a thing
        if (hotspot.hasOwnProperty("swapImage"))
        {
            let imageEl = $(evt.delegateTarget).find("img");
            imageEl.attr("src", globalImageManager.getUiImage(hotspot.swapImage).src);
        }

        //push title
        if (hotspot.hasOwnProperty("name"))
        {
            this.locationTitleEl.html(hotspot.name);
        }
    }

    onExitHotspot(evt: any, id: number): void
    {
        let hotspot = this.hotspots[id];

        //swap image back if applicable
        if (hotspot.hasOwnProperty("swapImage"))
        {
            let imageEl = $(evt.delegateTarget).find("img");
            imageEl.attr("src", globalImageManager.getUiImage(hotspot.image).src);
        }

        //clear title
        this.locationTitleEl.html("");
    }

    onClickHotspot(evt: any, id: number): void
    {
        let hotspot = this.hotspots[id];
        let next = hotspot.next;

        let microscript: any = null;

        if (hotspot.hasOwnProperty("microscript") && hotspot.microscript)
        {
            microscript = hotspot.microscript;
        }

        if (hotspot.hasOwnProperty("conditional") && hotspot.conditional)
        {
            this.gotoNextConditional(hotspot.conditional, microscript);
        }
        else
        {
            let nextScene: string = null;
            let nextFrame: string = null;
            let loc = next.split(".");
            nextScene = loc[0];
            if (loc.length > 1)
                nextFrame = loc[1];

            this.gotoNextSpecific(nextScene, nextFrame, microscript);
        }
    }
}
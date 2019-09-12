class ConfigController
{
    private rootNode: HTMLElement;
    private innerNode: HTMLElement;
    private infoNode: HTMLElement;

    constructor(rootNode: HTMLElement)
    {
        //setup container structure
        let outerEl = $("<div>").addClass("modalContainer");
        $(rootNode).append(outerEl);
        let innerEl = $("<div>").addClass("modalBox");
        innerEl.addClass("configBox");
        outerEl.append(innerEl);
        this.rootNode = outerEl.get(0);
        this.innerNode = innerEl.get(0);

        //create header and buttons
        innerEl.append($("<h1>Configuration</h1>"));

        let closeButtonEl = $("<button>");
        closeButtonEl.attr("id", "confirmButton");
        closeButtonEl.on("click", () => this.closePanel(true));
        closeButtonEl.text("Confirm");
        innerEl.append(closeButtonEl);

        let cancelButtonEl = $("<button>");
        cancelButtonEl.attr("id", "cancelButton");
        cancelButtonEl.on("click", () => this.closePanel(false));
        cancelButtonEl.text("Cancel");
        innerEl.append(cancelButtonEl);

        //language selection
        let langEl = $("<section>").addClass("configSection");
        innerEl.append(langEl);

        let langHeaderEl = $("<h2>Cinematic Language</h2>");
        langEl.append(langHeaderEl);

        let langSelectEl = $("<div>").addClass("languageSelection");
        langSelectEl.html(  "<input type='radio' name='language' value='English'> English &nbsp;" +
            "<input type='radio' name='language' value='Japanese'> Japanese");
        langEl.append(langSelectEl);
        $("input[name=language][value=" + GameLanguage[globalConfig.cinematicLanguage] + "]").prop("checked", true);

        //adult content selection
        let acEl = $("<section>").addClass("configSection");
        innerEl.append(acEl);

        let acHeaderEl = $("<h2>Content Option</h2>");
        acEl.append(acHeaderEl);

        let acSelectEl = $("<div>").addClass("autosaveSelection");
        acSelectEl.html("<input type='checkbox' name='adultcontent' value='Adultcontent'> Show Explicit Content");
        acEl.append(acSelectEl);
        $("input[name=adultcontent]").prop("checked", globalConfig.adultContent);

        //music volume
        let musicEl = $("<section>").addClass("configSection");
        innerEl.append(musicEl);

        let musicHeaderEl = $("<h2>Music Volume</h2>");
        musicEl.append(musicHeaderEl);

        let musicRangeEl = $("<div>").addClass("audioRange");
        musicRangeEl.html("<input type='range' min= '0' max= '100' value= '80' class='slider' id= 'musicRange'>");
        musicRangeEl.find("input").attr("value", globalConfig.musicVolume * 100);
        musicEl.append(musicRangeEl);

        //sound volume
        let soundEl = $("<section>").addClass("configSection");
        innerEl.append(soundEl);

        let soundHeaderEl = $("<h2>Sound Volume</h2>");
        soundEl.append(soundHeaderEl);

        let soundRangeEl = $("<div>").addClass("audioRange");
        soundRangeEl.html("<input type='range' min= '0' max= '100' value= '80' class='slider' id= 'soundRange'>");
        soundRangeEl.find("input").attr("value", globalConfig.soundVolume * 100);
        soundEl.append(soundRangeEl);

        //autosave selection
        let saveEl = $("<section>").addClass("configSection");
        innerEl.append(saveEl);

        let saveHeaderEl = $("<h2>Save Option</h2>");
        saveEl.append(saveHeaderEl);

        let saveSelectEl = $("<div>").addClass("autosaveSelection");
        saveSelectEl.html("<input type='checkbox' name='autosave' value='Autosave'> Autosave Enabled");
        saveEl.append(saveSelectEl);
        $("input[name=autosave]").prop("checked", globalConfig.useAutosave);
    }

    private closePanel(apply?: boolean): void
    {
        if (apply)
        {
            //actually read values from UI and apply to config
            let langname: string = <string>$("input[name=language]:checked").val();
            globalConfig.cinematicLanguage = GameLanguage[<keyof typeof GameLanguage>langname]; //um...
            globalConfig.useAutosave = <boolean>$("input[name=autosave]").prop("checked");
            globalConfig.adultContent = <boolean>$("input[name=adultcontent]").prop("checked");
            globalConfig.musicVolume = (<number>$("input#musicRange").val()) / 100;
            globalConfig.soundVolume = (<number>$("input#soundRange").val()) / 100;

            globalConfig.save();
            globalSoundManager.setVolume();
        }        

        $(this.rootNode).remove();
    }
}
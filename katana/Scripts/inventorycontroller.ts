class InventoryController
{
    private rootNode: HTMLElement;
    private innerNode: HTMLElement;
    private infoNode: HTMLElement;

    constructor(rootNode: HTMLElement)
    {        
        let outerEl = $("<div>").addClass("modalContainer");
        $(rootNode).append(outerEl);
        let innerEl = $("<div>").addClass("modalBox");
        innerEl.addClass("inventoryBox");
        outerEl.append(innerEl);
        this.rootNode = outerEl.get(0);
        this.innerNode = innerEl.get(0);

        innerEl.append($("<h1>Inventory</h1>"));

        let buttonEl = $("<button>");
        buttonEl.on("click", () => this.closePanel());
        buttonEl.text("Exit");
        innerEl.append(buttonEl);
        
        //display objects
        let invEl = $("<div>").addClass("inventoryList");
        innerEl.append(invEl);

        let inventoryObjects = this.countInventory();
        for (let key in inventoryObjects)
        {
            let value = inventoryObjects[key];
            let newEl = $("<p>");
            let text: string = "";
            if (globalData.defs.inventory.hasOwnProperty(key))
            {
                text += globalData.defs.inventory[key].name;
            }
            else
            {
                text += key;
            }
            text += "     x" + value;
            newEl.on("click", (evt) => this.showDetails(key, evt));
            newEl.text(text);
            invEl.append(newEl);
        }

        //infobox
        let infoEl = $("<div>").addClass("infoBox");
        infoEl.append($("<h1>"));
        infoEl.append($("<img>"));
        infoEl.append($("<p>"));
        this.infoNode = infoEl.get(0);
        innerEl.append(infoEl);
    }

    private countInventory(): object
    {
        let invObjects = new Object;
        for (let i = 0; i < globalState.inventory.length; i++)
        {
            let iName = globalState.inventory[i];
            if (invObjects.hasOwnProperty(iName))
            {
                invObjects[iName] += 1;
            }
            else
            {
                invObjects[iName] = 1;
            }
        }

        return invObjects;

    }

    private showDetails(key: string, evt?: JQueryEventObject): void
    {
        //$(evt.currentTarget).
        let infoEl = $(this.infoNode);

        infoEl.children("h1").text("");
        infoEl.children("img").removeAttr("src");
        infoEl.children("p").html("");

        let name: string;
        let imageName: string;
        let description: string;
        let statName: string;
        let statValue: number;
        if (globalData.defs.inventory.hasOwnProperty(key))
        {
            let iData = globalData.defs.inventory[key]; 
            name = iData.name;
            imageName = iData.image;
            description = iData.description;
            if (iData.hasOwnProperty("attack"))
            {
                statName = "attack";
                statValue = iData.attack;
            }
            else if (iData.hasOwnProperty("defence"))
            {
                statName = "defence";
                statValue = iData.defence;
            }
            
        }
        else
        {
            name = key;
            imageName = key;
            description = "";
        }

        let image = globalImageManager.getUiImage(imageName);
        let imageSrc: string;
        if (image)
            imageSrc = image.src;
        

        infoEl.children("h1").text(name);
        infoEl.children("img").attr("src", imageSrc);
        infoEl.children("p").html(description);
        
        if (statName)
        {
            let statString = "<br><br><strong>" + statName + " +" + statValue + "</strong>";
            infoEl.children("p").html(description + statString);
        }

        //TODO executable items

    }

    private closePanel(): void
    {
        $(this.rootNode).remove();
    }
}
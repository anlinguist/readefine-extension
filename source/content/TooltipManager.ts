import { PageTextUpdater } from "./PageTextUpdater";

export class TooltipManager {
    tooltip: any;
    instances: any[];
    hoveredData: any;
    pageUpdater: PageTextUpdater;
    readefineLogoImage: string;

    constructor(pageUpdater: PageTextUpdater) {
        this.tooltip = null;
        this.instances = [];
        this.hoveredData = {};
        this.pageUpdater = pageUpdater;
        this.readefineLogoImage = chrome.runtime.getURL("assets/testicon.png");
    }

    showTooltipOn(target: any) {
        if (this.tooltip) {
            // @ts-expect-error TS(2304): Cannot find name 'readefine_tooltip'.
            readefine_tooltip.hideAll();
        }
        this.instances.forEach((instance: any) => {
            instance.destroy();
        });
        this.instances.length = 0;
        this.tooltip = this.createTooltip(target);
        this.tooltip.show();
        this.instances = this.instances.concat(this.tooltip);
    }

    createTooltip(target: any) {
        // @ts-expect-error TS(2304): Cannot find name 'readefine_tooltip'.
        return readefine_tooltip(target, this.getTooltipOptions(target));
    }

    getTooltipOptions(target: any) {
        return {
            content: (reference: any) => this.getTooltipContent(reference),
            allowHTML: true,
            interactive: true,
            animation: "shift-away",
            theme: "readefine",
            appendTo: document.body,
            interactiveBorder: 10,
            inlinePositioning: true,
            hideOnClick: false,
            zIndex: 9999999999,
            onHidden(instance: any) {
                instance.destroy();
                var elements = document.querySelectorAll(".newdivinstances");
                for (var i = 0; i < elements.length; i++) {
                    elements[i].remove();
                }
            },
        };
    }

    getTooltipContent(reference: any) {
        let id = reference.id.replace("readefinition", "");
        let data: any = this.pageUpdater.readefinitionsList[id];
        if (!data) return;

        // Determine how to process the tooltip based on the data type.
        if (data.type === "conversion") {
            // For conversion data, format the conversion-specific info.
            this.formatConversionHoveredData(data);
            return this.generateConversionHTMLContent();
        } else {
            // For the old dictionary/definition data:
            this.formatHoveredData(data);
            // Show either the original or target based on the current mode.
            this.hoveredData["show"] =
                this.pageUpdater.readefineMode === "reading"
                    ? this.hoveredData["original"]
                    : this.hoveredData["target"];
            let { dictionaryName, dictionaryLink, disableDictLink } =
                this.formatDictionaryName();
            this.hoveredData["dictionaryName"] = dictionaryName;
            this.hoveredData["dictionaryLink"] = dictionaryLink;
            this.hoveredData["disableDictLink"] = disableDictLink;
            this.formatDefinitionStatus();
            this.formatLinkStatus();

            return this.generateHTMLContent();
        }
    }

    // Legacy formatting for dictionary/definition data.
    formatHoveredData(data: any) {
        this.hoveredData = {
            original: data["original"],
            target: data["target"],
            definition:
                data["definition"] &&
                    data["definition"] !== "false" &&
                    data["definition"] !== "undefined"
                    ? data["definition"]
                    : false,
            dictionary: data["dictionary"],
            link: data["link"] && data["link"] !== "false" ? data["link"] : false,
            type: data["type"],
            mode: this.pageUpdater.readefineMode,
        };

        if (this.pageUpdater.readefineMode === "reading") {
            this.hoveredData["show"] = data["original"];
        } else {
            this.hoveredData["show"] = data["target"];
        }

        if (data["aiOperation"]) {
            this.hoveredData["aiOperation"] = data["aiOperation"];
        }
        if (data["aiTarget"]) {
            this.hoveredData["aiTarget"] = data["aiTarget"];
        }
    }

    // New helper to format conversion data.
    formatConversionHoveredData(data: any) {
        this.hoveredData = {
            original: data["original"],
            target: data["target"],
            type: data["type"],
            conversionData: data["conversionData"],
        };

        // Choose what text to show based on the current mode.
        this.hoveredData["show"] =
            this.pageUpdater.readefineMode === "reading"
                ? data["original"]
                : data["target"];
    }

    // Returns dictionary name, link, and CSS classes based on type.
    formatDictionaryName() {
        let dictionaryProperties: any = {};

        switch (this.hoveredData["type"]) {
            case "main":
                dictionaryProperties = {
                    dictionaryName: "Readefine Dictionary",
                    dictionaryLink: "",
                    disableDictLink: "disabledictlink",
                };
                break;

            case "user":
                dictionaryProperties = {
                    dictionaryName: "Personal Dictionary",
                    dictionaryLink: "https://app.readefine.ai/personal-dictionary",
                    disableDictLink: "",
                };
                break;

            case "community":
                dictionaryProperties = {
                    dictionaryName: this.hoveredData["dictionary"] + " Community Dictionary",
                    dictionaryLink: `https://app.readefine.ai/community-dictionaries/${this.hoveredData["dictionary"]}`,
                    disableDictLink: "",
                };
                break;

            case "location":
                let dictName =
                    this.hoveredData["dictionary"] === "US"
                        ? "UK to US Dictionary"
                        : "US to UK Dictionary";
                dictionaryProperties = {
                    dictionaryName: dictName,
                    dictionaryLink: "",
                    disableDictLink: "disabledictlink",
                };
                break;

            case "team":
                dictionaryProperties = {
                    dictionaryName: this.hoveredData["dictionary"] + " Team Dictionary",
                    dictionaryLink: `https://app.readefine.ai/team-dictionaries/${this.hoveredData["dictionary"]}`,
                    disableDictLink: "",
                };
                break;

            case "ai":
                dictionaryProperties = {
                    disableDictLink: "disabledictlink",
                };
                break;

            default:
                dictionaryProperties = {
                    dictionaryName: "",
                    dictionaryLink: "",
                    disableDictLink: "",
                };
        }
        return dictionaryProperties;
    }

    // Adjusts tooltip appearance based on whether a definition exists.
    formatDefinitionStatus() {
        if (this.hoveredData["definition"]) {
            this.hoveredData["rdfnDef"] = "rdfn_def_visible";
            this.hoveredData["rdfnDefAppearance"] = "readefine-definition-visible";
        } else {
            this.hoveredData["rdfnDef"] = "rdfn_def";
            this.hoveredData["rdfnDefAppearance"] = "readefine-definition-default";
        }
    }

    // Adjusts link visibility.
    formatLinkStatus() {
        if (this.hoveredData["link"]) {
            this.hoveredData["linkVisible"] = "linkvisible";
        } else {
            this.hoveredData["linkVisible"] = "";
        }
    }

    // Generates HTML for dictionary/definition tooltips.
    generateHTMLContent() {
        let editFolder = "";
        let aiContent = "";

        if (this.hoveredData["type"] === "ai") {
            aiContent = this.generateAIContent();
        }

        if (
            this.hoveredData["dictionaryName"] &&
            this.hoveredData["dictionaryName"] !== "Readefine Dictionary" &&
            this.hoveredData["dictionaryName"] !== "UK to US Dictionary" &&
            this.hoveredData["dictionaryName"] !== "US to UK Dictionary"
        ) {
            editFolder =
                '<a title="' +
                this.hoveredData["dictionaryName"] +
                '" target="_blank" class="' +
                this.hoveredData["disableDictLink"] +
                '" href="' +
                this.hoveredData["dictionaryLink"] +
                '" id="readefine-dictionary-name">' +
                '<span class="dict_class">&#xe2c7;</span>' +
                "</a>";
        }

        let htmlContent =
            '<div id="readefine-original-word">' +
            this.hoveredData["show"] +
            '</div><div id="rdfn-tooltip">';

        if (aiContent) {
            htmlContent +=
                '<div id="readefine-ai-content">' + aiContent + "</div>";
        }
        htmlContent +=
            '<div id="' +
            this.hoveredData["rdfnDef"] +
            '"><div id="rdfnDefAppearance" class="' +
            this.hoveredData["rdfnDefAppearance"] +
            '">' +
            this.hoveredData["definition"] +
            '</div><div id="rdfn_expand_out" class="dict_class">&#xe5cf;</div><div id="rdfn_expand_in" class="dict_class">&#xe5ce;</div></div>' +
            '<a id="rdfn_link" href="' +
            this.hoveredData["link"] +
            '" class="' +
            this.hoveredData["linkVisible"] +
            '" target="_blank">Learn more...</a>' +
            '<div class="readefine-tt-logo-container">' +
            '<img class="readefine-tt-logo" src="' +
            this.readefineLogoImage +
            '">' +
            '<div id="readefine-tt-team-logo"></div>' +
            '<div class="readefine-tt-fb">' +
            editFolder +
            '<span id="readefine_settings" class="dict_class">&#xe8b8;</span>' +
            '<span id="edit_readefinition" class="dict_class">&#xe3c9;</span>' +
            "</div></div></div>";
        return htmlContent;
    }

    iconShare() {
        return (
            `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-share-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1"></path><path d="M12 14v-11"></path><path d="M9 6l3 -3l3 3"></path></svg>`
        )
    }

    // Generates HTML for conversion tooltips.
    generateConversionHTMLContent() {
        const conv = this.hoveredData.conversionData;
        // Create a link to the conversion category.
        const conversionLink = `https://app.readefine.ai/conversions/${conv.category}`;
        const formulaText =
            conv.type === "formula" ? conv.formula : "Dynamic conversion";

        let htmlContent =
            '<div id="readefine-original-word">' +
            this.hoveredData["show"] +
            '</div><div id="rdfn-tooltip">';
        htmlContent += '<div class="rdfnconversion-info">';
        htmlContent +=
            `<div class="rdfnconversion-name"><strong>Conversion:</strong> ${conv.sourceName} to ${conv.targetName}</div>`;
        htmlContent +=
            `<div class="rdfnconversion-category"><strong>Category:</strong> <a href="${conversionLink}" target="_blank"><span>${conv.category}</span> <span style={{display: 'inline-block'}}>${this.iconShare()}</span></a></div>`;
        htmlContent +=
            `<div class="rdfnconversion-formula"><strong>Formula:</strong> ${formulaText}</div>`;
        htmlContent += "</div>";
        htmlContent +=
            '<div class="readefine-tt-logo-container">' +
            '<img class="readefine-tt-logo" src="' +
            this.readefineLogoImage +
            '">' +
            '<div id="readefine-tt-team-logo"></div>' +
            '<div class="readefine-tt-fb">' +
            '<span id="readefine_settings" class="dict_class">&#xe8b8;</span>' +
            "</div></div></div>";
        return htmlContent;
    }

    generateAIContent() {
        const operationsTargets = {
            Simplify: ['Average Adults', 'ESL', 'Children', 'Boomers', 'Millenials', 'Gen Z'],
            Tone: ['friendly', 'professional', 'optimistic', 'pessimistic', 'angry', 'sad', 'happy', 'excited', 'bored', 'confused', 'scared', 'surprised', 'disgusted', 'neutral', 'sarcastic'],
            Summarize: [],
            Complexify: [],
            Translate: ['English', 'Spanish', 'Russian', 'Italian', 'French', 'Portuguese', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Polish', 'Romanian', 'Greek', 'Bulgarian', 'Czech', 'Danish', 'Finnish', 'Hebrew', 'Hungarian', 'Indonesian', 'Malay', 'Norwegian', 'Persian', 'Swedish', 'Thai', 'Ukrainian', 'Vietnamese', 'Old English', 'Classical Latin', 'Koine Greek', 'Ancient Hebrew'],
            Reword: ['a pirate', 'a love letter', 'a sci-fi novel', 'a mob boss', 'Yoda', 'Shakespeare', 'a western cowboy', 'a film noir detective'],
            Convert: ['Imperial', 'Metric', 'Celsius', 'Fahrenheit']
        };

        const operation = this.hoveredData['aiOperation'];
        const target = this.hoveredData['aiTarget'];

        return `Readefine AI reworded this text using the ${operation} style${target ? ` with the ${target} target` : ""}.`;
    }
}

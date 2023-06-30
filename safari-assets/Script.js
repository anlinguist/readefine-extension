function show(platform, enabled) {
    document.body.classList.add(`platform-${platform}`);

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

document.documentElement.addEventListener("click", function(e) {
    if (e.target.id == "rdfn-splashscreen-welcome-btn") {
        var valueToSend = "open-safari"
        webkit.messageHandlers.controller.postMessage(valueToSend);
        console.log("sent message to containing app.")
    }
})

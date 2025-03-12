import { ReadefineManager } from "./ReadefineManager";

window.addEventListener("load", async function () {
    if (!window.readefineManager) {
        const readefineManager = new ReadefineManager();
        window.readefineManager = readefineManager;
    }
});
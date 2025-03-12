import { ReadefineManager } from "../content/ReadefineManager";

declare global {
    interface Window {
        readefineManager?: ReadefineManager;
    }
}
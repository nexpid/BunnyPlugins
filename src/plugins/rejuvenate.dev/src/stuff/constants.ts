import { settings } from "@vendetta";

const identitySymbol = Symbol.for("rejuvenate.identity");
export const identity: string =
    window[identitySymbol] ??
    (window[identitySymbol] = Array.from(
        crypto.getRandomValues(new Uint8Array(48)),
    )
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""));

const initialSymbol = Symbol.for("rejuvenate.initial");
export const initial = window[initialSymbol]
    ? false
    : (window[initialSymbol] = true);

export const getPluginUrl = () => settings.debuggerUrl.slice(0, -4) + "8731";

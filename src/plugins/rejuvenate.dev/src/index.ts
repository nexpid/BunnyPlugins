import { timeout, tryToConnect, ws } from "./stuff/ws";

export const onLoad = () => tryToConnect();
export const onUnload = () => {
    ws && ws.close(1000, "plugin stopped");
    clearTimeout(timeout);
};

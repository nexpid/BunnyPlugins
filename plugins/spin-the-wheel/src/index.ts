import { id, storage } from "@vendetta/plugin";
import { removePlugin } from "@vendetta/plugins";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { runWheel } from "./stuff/wheel";

const disagree = () => {
  removePlugin(id);
  showToast("Uninstalled", getAssetIDByName("Check"));
};
const confirm = (message: string) =>
  new Promise<void>((res) =>
    showConfirmationAlert({
      title: "Spin The Wheel Confirmation",
      content: message,
      confirmText: "Continue",
      confirmColor: "red" as ButtonColors,
      onConfirm: res,
      cancelText: "Cancel",
      //@ts-ignore
      onCancel: disagree,
      isDismissable: false,
    })
  );

export enum DangerLevel {
  Annoying,
}

export const vstorage: {
  agreed?: boolean;
  settings?: {
    dangerLevel: DangerLevel;
  };
} = storage;

export default {
  onLoad: () => {
    showConfirmationAlert({
      title: "fdhdghfdH",
      content: "fghdghdfhdfghdfghfdgh",
      confirmText: "yes",
      confirmColor: "brand" as ButtonColors,
      onConfirm: () => {
        runWheel();
      },
      cancelText: "no",
    });
    // if (vstorage.agreed === undefined)
    //   confirm(
    //     "This is a really dangerous plugin, you'll have to first agree to all following popups"
    //   ).then(() =>
    //     confirm(
    //       "By using this plugin, you accept the risk of important Vendetta files being deleted."
    //     ).then(() =>
    //       confirm(
    //         "By using this plugin, you accept the risk of leaking your sensitive information."
    //       ).then(() =>
    //         confirm("Lastly, this plugin is just a silly little joke :3").then(
    //           () => {
    //             vstorage.agreed = true;
    //             showToast("Agreed to everything!", getAssetIDByName("Check"));
    //             runWheel();
    //           }
    //         )
    //       )
    //     )
    //   );
  },
  onUnload: () => {},
};

import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

export default function <T>(
  fnc: (signal: AbortSignal) => Promise<T>,
  deps: any[]
) {
  const [state, setState] = React.useState<T>();

  React.useEffect(() => {
    const controller = new AbortController();
    fnc(controller.signal)
      .then((x) => setState(x))
      .catch((e) => {
        console.log(e);
        if (e.status) {
          showToast(`${e.status}: ${e.text}`, getAssetIDByName("Small"));
        } else showToast(e?.message ?? `${e}`, getAssetIDByName("Small"));
      });

    return () => controller.abort();
  }, deps);

  return state;
}

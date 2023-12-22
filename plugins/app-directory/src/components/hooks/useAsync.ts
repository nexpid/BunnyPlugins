import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

export default function <T>(
  fnc: (signal: AbortSignal) => Promise<T> | T,
  deps: any[],
): T | undefined {
  const [state, setState] = React.useState<T>(undefined);

  let tim: number;
  React.useEffect(() => {
    const controller = new AbortController();

    setState(undefined);

    clearTimeout(tim);
    tim = setTimeout(async () => {
      let res: any;
      try {
        res = await fnc(controller.signal);
      } catch (e) {
        console.log(e, e.stack);
        if (e.status) {
          showToast(`${e.status}: ${e.text}`, getAssetIDByName("Small"));
        } else showToast(e?.message ?? `${e}`, getAssetIDByName("Small"));
      }
      setState(res);
    });

    return () => controller.abort();
  }, deps);

  return state;
}

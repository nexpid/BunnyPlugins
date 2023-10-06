import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";

const {
  meta: { resolveSemanticColor },
} = findByProps("colors", "meta");

export default function () {
  const patches = new Array<() => void>();

  window.nx = {
    get semantic() {
      const data = {};
      for (const [key, raw] of Object.entries(semanticColors)) {
        data[key] = Object.fromEntries(
          ["dark", "darker", "light", "amoled"].map((x) => [
            x,
            resolveSemanticColor(x, raw),
          ])
        );
      }
      return data;
    },
    findColor: (hex = "#000000") =>
      Object.fromEntries(
        Object.entries(window.nx.semantic)
          .map(([x, y]) => [
            x,
            Object.fromEntries(Object.entries(y).filter(([_, z]) => z === hex)),
          ])
          .filter(([_, z]) => Object.entries(z)[0])
      ),

    p: {
      wipe: () => {
        patches.forEach((x) => x());
        patches.length = 0;
      },
      snipe: (
        key: string,
        parent: any,
        callback?: (args: any[], ret: any) => any,
        oneTime?: boolean
      ) => {
        const patch = after(
          key,
          parent,
          callback ?? ((a, b) => console.log("[NX]:", a, b)),
          oneTime ?? false
        );
        patches.push(patch);
      },
    },
  };
  return () => delete window.nx;
}

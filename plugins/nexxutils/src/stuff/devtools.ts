import { after, before } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";

import { resolveSemanticColor } from "$/types";

export default function () {
  const patches = new Array<() => void>();

  const collected = new Map<
    string,
    {
      get: () => object;
      unpatch: () => void;
    }
  >();
  window.nx = {
    get semantic() {
      const data = {};
      for (const [key, raw] of Object.entries(semanticColors)) {
        data[key] = Object.fromEntries(
          ["dark", "darker", "midnight", "light"].map((x) => [
            x,
            resolveSemanticColor(raw, x),
          ]),
        );
      }
      return data;
    },
    searchSemantic(query: string) {
      query ??= "";
      return Object.fromEntries(
        Object.entries(window.nx.semantic).filter(([x]) =>
          query.startsWith("^") && query.endsWith("$")
            ? x.toLowerCase() === query.toLowerCase().slice(1, -1)
            : query.startsWith("^")
              ? x.toLowerCase().startsWith(query.toLowerCase().slice(1))
              : query.endsWith("$")
                ? x.toLowerCase().endsWith(query.toLowerCase().slice(0, -1))
                : x.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    },
    findSemantic(hex: string) {
      hex ??= "";
      return Object.fromEntries(
        Object.entries(window.nx.semantic)
          .map(([x, y]) => [
            x,
            Object.fromEntries(Object.entries(y).filter(([_, z]) => z === hex)),
          ])
          .filter(([_, z]) => Object.entries(z)[0]),
      );
    },

    p: {
      wipe: () => {
        patches.forEach((x) => x());
        patches.length = 0;
      },
      snipe: (
        prop: string,
        parent: any,
        callback?: (args: any[], ret: any) => any,
        oneTime?: boolean,
      ) => {
        const patch = after(
          prop,
          parent,
          callback ?? ((a, b) => console.log("[NX]:", a, b)),
          oneTime ?? false,
        );
        patches.push(patch);
      },
      props: {
        collect: (key: string, prop: string, parent: any) => {
          collected.get(key)?.unpatch();

          const unpatch = before(prop, parent, ([props]) => {
            for (const p of Object.keys(props))
              !(p in data && props[p]) && (data[p] = props[p]);
          });
          patches.push(unpatch);

          const data: object = {};
          collected.set(key, {
            unpatch,
            get: () => data,
          });
        },
        redeem: (key: string) => {
          const coll = collected.get(key);
          if (!coll) return;

          coll.unpatch();
          return coll.get();
        },
      },
    },
  };
  return () => {
    window.nx?.p.wipe();
    delete window.nx;
  };
}

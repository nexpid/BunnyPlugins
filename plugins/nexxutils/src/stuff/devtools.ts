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

          let ran = false;
          const unpatch = before(prop, parent, ([props]) => {
            for (const p of Object.keys(props)) {
              if (!data[p] && ran)
                data[p] ??= {
                  kinds: ["undefined"],
                  stuff: ["undefined"],
                };
              else
                data[p] ??= {
                  kinds: [],
                  stuff: [],
                };
              ran = true;

              const stuff = Array.isArray(props[p]) ? props[p] : [props[p]];
              for (const x of stuff) {
                const kind = Array.isArray(x) ? "array" : typeof x;
                if (
                  !data[p].stuff.find(
                    (y: any) => JSON.stringify(y) === JSON.stringify(x),
                  )
                )
                  data[p].stuff.push(x);
                if (!data[p].kinds.includes(kind)) data[p].kinds.push(kind);
              }

              console.log(`[NX]: Collected new prop for "${key}"`);
            }

            for (const r of Object.keys(data))
              if (!(r in props)) {
                if (!data[r].kinds.includes("undefined"))
                  data[r].kinds.push("undefined");
                if (!data[r].stuff.includes("undefined"))
                  data[r].stuff.push("undefined");
              }
          });
          patches.push(unpatch);

          const data: object = {};
          collected.set(key, {
            unpatch,
            get: () => data,
          });
        },
        redeem: (key: string, save?: boolean) => {
          const coll = collected.get(key);
          if (!coll) return;

          coll.unpatch();
          if (save) {
            // this is a debug thing i added to vdebug lol
            console.log(
              `DEBUG\0SAVEFILE\0${JSON.stringify("nexxutils_" + key + ".json")}\0${JSON.stringify(JSON.stringify(coll.get(), undefined, 3))}`,
            );
          } else return coll.get();
        },
      },
    },
  };
  return () => {
    window.nx?.p.wipe();
    delete window.nx;
  };
}

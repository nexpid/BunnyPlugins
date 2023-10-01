import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";

const {
  meta: { resolveSemanticColor },
} = findByProps("colors", "meta");

export default function () {
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
  };
  return () => delete window.nx;
}

import { storage } from "@vendetta/plugin";

const make = (root: any, base: any) =>
  new Proxy(root, {
    get(target, prop: string, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (val !== undefined && val !== null) return val;

      const prev = base[prop];
      if (prev === undefined || prev === null) return prev;
      else if (typeof prev === "object") {
        root[prop] ??= Array.isArray(prev) ? [] : {};
        return make(root[prop], prev);
      } else return prev;
    },
  });

export function makeStorage<Storage extends object>(store: Storage): Storage {
  return make(storage, store);
}

import { frameSet, scaleSet } from "../components/Kiryu";

const actions = {
  left: [1, 2, 1, 0],
  right: [3, 4, 3, 0],
};
const fps = 1000 / 20;

let curInt: number;

export function sendAction(action: keyof typeof actions) {
  const act = actions[action];
  scaleSet?.();

  let index = 0;

  clearInterval(curInt);
  curInt = setInterval(() => {
    index++;
    frameSet?.(act[index - 1]);
    if (index >= act.length) clearInterval(curInt);
  }, fps);
}

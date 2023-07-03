import { FluxDispatcher } from "@vendetta/metro/common";
import { forceUpdateSettings } from "../components/Settings";
import { dispatchActivityIfPossible } from "./activity";

let cronjobs: Record<
  string,
  {
    default: boolean;
    timeout: number;
  }
> = {};

export function registerChangeCronJob(
  key: string,
  cron: (date: Date) => number,
  run: () => void,
  isDefault?: boolean
) {
  if (cronjobs[key]) return;
  const change = {
    default: isDefault,
    timeout: -1,
  };
  cronjobs[key] = change;

  const thing = () => {
    const next = cron(new Date());
    change.timeout = setTimeout(() => {
      run();
      thing();
    }, next - Date.now());
  };
  thing();
}

const fluxEvents: Record<
  string,
  {
    default: boolean;
    event: string;
    handler: () => void;
  }
> = {};

export function registerChangeFluxEvent(
  key: string,
  event: string,
  run: () => void,
  isDefault?: boolean
) {
  if (fluxEvents[key]) return;

  FluxDispatcher.subscribe(event, run);
  fluxEvents[key] = {
    default: isDefault,
    event,
    handler: run,
  };
}

export function unregisterChanges(everything?: boolean) {
  for (const [x, y] of Object.entries(cronjobs))
    if (everything || !y.default) {
      clearTimeout(y.timeout);
      delete cronjobs[x];
    }

  for (const [x, y] of Object.entries(fluxEvents))
    if (everything || !y.default) {
      FluxDispatcher.unsubscribe(y.event, y.handler);
      delete fluxEvents[x];
    }
}

export function registerDefaultChanges() {
  registerChangeCronJob(
    "auto_fix_timestamps",
    (x) => x.setHours(24, 0, 0, 0),
    () => {
      forceUpdateSettings?.();
      dispatchActivityIfPossible();
    },
    true
  );
}

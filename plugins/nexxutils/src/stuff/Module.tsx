import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Forms, General } from "@vendetta/ui/components";
import { vstorage } from "..";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { SimpleText } from "../../../../stuff/types";
import SmartMention from "../../../../stuff/components/SmartMention";

const { View } = General;
const { FormRow, FormSwitchRow, FormDivider } = Forms;

export enum ModuleCategory {
  Useful,
  Fixes,
}
export const moduleCategoryMap = [
  {
    category: ModuleCategory.Useful,
    title: "Useful",
    icon: getAssetIDByName("img_nitro_remixing"),
  },
  {
    category: ModuleCategory.Fixes,
    title: "Fixes",
    icon: getAssetIDByName("debug"),
  },
] as {
  category: ModuleCategory;
  title: string;
  icon: number;
}[];

type ModuleSetting = {
  label: string;
  subLabel: string;
  icon?: number;
} & {
  type: "toggle";
  default: boolean;
};

class Patches {
  store = new Array<() => void>();

  add(patch: () => void) {
    this.store.push(patch);
  }

  unpatch() {
    this.store.forEach((x) => x());
    this.store.length = 0;
  }
}

interface ModuleExtra {
  credits: string[];
}

export class Module {
  id: string;
  label: string;
  sublabel: string;
  category: ModuleCategory;
  icon?: number;
  settings?: Record<string, ModuleSetting>;
  extra?: ModuleExtra;

  #onStart: (this: Module) => void;
  #onStop: (this: Module) => void;

  patches = new Patches();

  constructor({
    id,
    label,
    sublabel,
    category,
    icon,
    settings,
    extra,
    runner,
  }: {
    id: string;
    label: string;
    sublabel: string;
    category: ModuleCategory;
    icon?: number;
    settings?: Record<string, ModuleSetting>;
    extra?: ModuleExtra;
    runner: {
      onStart: (this: Module) => void;
      onStop: (this: Module) => void;
    };
  }) {
    this.id = id;
    this.label = label;
    this.sublabel = sublabel;
    this.category = category;
    this.icon = icon;
    this.settings = settings;
    this.extra = extra;

    this.#onStart = runner.onStart.bind(this);
    this.#onStop = runner.onStop.bind(this);
  }

  get storage() {
    return vstorage.modules[this.id]!;
  }

  init() {
    vstorage.modules[this.id] ??= {
      enabled: false,
      options: this.settings
        ? Object.fromEntries(
            Object.entries(this.settings).map(([x, y]) => [x, y.default])
          )
        : {},
    };

    if (this.storage.enabled) this.start();
    else this.stop();
  }
  exit() {
    if (this.storage.enabled) this.stop();
  }

  get component(): React.FunctionComponent {
    return (() => {
      const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
      const [hidden, setHidden] = React.useState(true);

      return (
        <>
          <FormRow
            label={this.label}
            subLabel={this.sublabel}
            leading={this.icon && <FormRow.Icon source={this.icon} />}
            trailing={
              <FormRow.Arrow
                style={{ transform: [{ rotate: `${hidden ? 180 : 90}deg` }] }}
              />
            }
            onPress={() => {
              setHidden(!hidden);
              RN.LayoutAnimation.configureNext(
                RN.LayoutAnimation.Presets.easeInEaseOut
              );
            }}
          />
          {!hidden && (
            <>
              <FormDivider />
              <RN.View style={{ paddingHorizontal: 15 }}>
                {this.extra?.credits && (
                  <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
                    <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
                      Additional credits go to:{" "}
                      {this.extra.credits.map((x, i, a) => (
                        <>
                          {!Number.isNaN(Number(x)) ? (
                            <SmartMention userId={x} loadUsername={true} />
                          ) : (
                            x
                          )}
                          {i !== a.length - 1 ? ", " : ""}
                        </>
                      ))}
                    </SimpleText>
                  </View>
                )}
                <FormSwitchRow
                  label="Enabled"
                  onValueChange={() => {
                    this.toggle();
                    forceUpdate();
                  }}
                  value={this.storage.enabled}
                />
              </RN.View>
            </>
          )}
        </>
      );
    }).bind(this);
  }

  toggle() {
    if (this.storage.enabled) this.stop();
    this.storage.enabled = !this.storage.enabled;

    if (this.storage.enabled) this.start();
    else this.stop();
  }
  start() {
    this.#onStart();
  }
  stop() {
    this.#onStop();
    this.patches.unpatch();
  }
}

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
  subLabel?: string;
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
  settings: Record<string, ModuleSetting>;
  extra?: ModuleExtra;

  #handlers: {
    onStart?: (this: Module) => void;
    onStop?: (this: Module) => void;
  };

  patches = new Patches();

  constructor({
    id,
    label,
    sublabel,
    category,
    icon,
    settings,
    extra,
    handlers,
  }: {
    id: string;
    label: string;
    sublabel: string;
    category: ModuleCategory;
    icon?: number;
    settings?: Record<string, ModuleSetting>;
    extra?: ModuleExtra;
    handlers: {
      onStart: (this: Module) => void;
      onStop: (this: Module) => void;
    };
  }) {
    this.id = id;
    this.label = label;
    this.sublabel = sublabel;
    this.category = category;
    this.icon = icon;
    this.settings = settings ?? {};
    this.extra = extra;
    this.#handlers = handlers;
  }

  get storage(): {
    enabled: boolean;
    options: {
      [k in keyof typeof this.settings]: (typeof this.settings)[k]["default"];
    };
  } {
    vstorage.modules[this.id] ??= {
      enabled: false,
      options: Object.fromEntries(
        Object.entries(this.settings).map(([x, y]) => [x, y.default])
      ),
    };
    return vstorage.modules[this.id];
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
                {Object.entries(this.settings).map(
                  ([id, setting]) =>
                    setting.type === "toggle" && (
                      <FormSwitchRow
                        label={setting.label}
                        subLabel={setting.subLabel}
                        onValueChange={() => {
                          this.storage.options[id] = !this.storage.options[id];
                          this.restart();
                          forceUpdate();
                        }}
                        value={this.storage.options[id]}
                      />
                    )
                )}
              </RN.View>
            </>
          )}
        </>
      );
    }).bind(this);
  }

  toggle() {
    this.storage.enabled = !this.storage.enabled;
    if (this.storage.enabled) this.start();
    else this.stop();
  }
  restart() {
    if (this.storage.enabled) {
      this.stop();
      this.start();
    }
  }
  start() {
    this.#handlers?.onStart.bind(this)();
  }
  stop() {
    this.#handlers?.onStop.bind(this)();
    this.patches.unpatch();
  }
}

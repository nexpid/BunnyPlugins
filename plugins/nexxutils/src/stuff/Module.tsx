import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Button, Forms, General } from "@vendetta/ui/components";
import { vstorage } from "..";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { openSheet, SimpleText } from "../../../../stuff/types";
import SmartMention from "../../../../stuff/components/SmartMention";
import ChooseSettingSheet from "../components/sheets/ChooseSettingSheet";

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
} & (
  | {
      type: "toggle";
      default: boolean;
    }
  | {
      type: "button";
      action: (this: Module) => void;
    }
  | {
      type: "choose";
      choices: string[];
      default: string;
    }
);

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
    this.settings = Object.fromEntries(
      Object.entries(settings ?? {}).map(([x, y]) => {
        if ("default" in y) y.icon ??= getAssetIDByName("ic_message_edit");
        return [x, y];
      })
    );
    this.extra = extra;
    this.#handlers = handlers;
  }

  get storage(): {
    enabled: boolean;
    options: {
      [k in keyof typeof this.settings]: (typeof this.settings)[k]["default"];
    };
  } {
    const options = Object.fromEntries(
      Object.entries(this.settings)
        .filter(([_, x]) => "default" in x)
        //@ts-ignore fuck off typescript
        .map(([x, y]) => [x, y.default])
    );

    vstorage.modules[this.id] ??= {
      enabled: false,
      options,
    };
    for (const [k, v] of Object.entries(options)) {
      const opts = vstorage.modules[this.id].options;
      if (typeof v !== typeof opts[k]) opts[k] = v;
    }

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
                  leading={
                    <FormRow.Icon source={getAssetIDByName("ic_cog_24px")} />
                  }
                  value={this.storage.enabled}
                />
                {Object.entries(this.settings).map(([id, setting]) =>
                  setting.type === "toggle" ? (
                    <FormSwitchRow
                      label={setting.label}
                      subLabel={setting.subLabel}
                      onValueChange={() => {
                        this.storage.options[id] = !this.storage.options[id];
                        this.restart();
                        forceUpdate();
                      }}
                      leading={<FormRow.Icon source={setting.icon} />}
                      value={this.storage.options[id]}
                    />
                  ) : setting.type === "button" ? (
                    <View style={{ marginVertical: 12 }}>
                      <Button
                        size="small"
                        text={setting.label}
                        color="brand"
                        onPress={() => setting.action.bind(this)()}
                        renderIcon={() => (
                          <RN.Image
                            style={{ marginRight: 8 }}
                            source={setting.icon}
                          />
                        )}
                      />
                    </View>
                  ) : (
                    setting.type === "choose" && (
                      <FormRow
                        label={setting.label}
                        subLabel={setting.subLabel}
                        onPress={() =>
                          openSheet(ChooseSettingSheet, {
                            label: setting.label,
                            value: this.storage.options[id],
                            choices: setting.choices,
                            update: (val) => {
                              this.storage.options[id] = val;
                              this.restart();
                              forceUpdate();
                            },
                          })
                        }
                        leading={<FormRow.Icon source={setting.icon} />}
                        trailing={
                          <SimpleText
                            variant="text-md/medium"
                            color="TEXT_MUTED"
                          >
                            {this.storage.options[id]}
                          </SimpleText>
                        }
                      />
                    )
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

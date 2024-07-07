import { logger } from "@vendetta";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet } from "$/components/ActionSheet";
import ChooseSheet from "$/components/sheets/ChooseSheet";
import SmartMention from "$/components/SmartMention";
import Text from "$/components/Text";
import { Button } from "$/lib/redesign";
import { openModal, resolveSemanticColor } from "$/types";

import { vstorage } from "..";
import ErrorViewerModal from "../components/modals/ErrorViewerModal";

const { View } = General;
const { FormRow, FormSwitchRow, FormDivider } = Forms;

export enum ModuleCategory {
  Useful,
  Fixes,
  Fun,
}
export const moduleCategoryMap = [
  {
    category: ModuleCategory.Useful,
    title: "Useful",
    icon: getAssetIDByName("PencilSparkleIcon"),
  },
  {
    category: ModuleCategory.Fixes,
    title: "Fixes",
    icon: getAssetIDByName("WrenchIcon"),
  },
  {
    category: ModuleCategory.Fun,
    title: "Fun",
    icon: getAssetIDByName("GameControllerIcon"),
  },
] as {
  category: ModuleCategory;
  title: string;
  icon: number;
}[];

type ModuleSetting = {
  label: string;
  icon?: number;
} & (
  | {
      subLabel?: string | ((value: boolean) => string);
      type: "toggle";
      default: boolean;
    }
  | {
      type: "button";
      action: (this: Module<any>) => void;
    }
  | {
      subLabel?: string | ((value: string) => string);
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
  credits?: string[];
  warning?: string;
}

enum ModuleErrorLabel {
  OnStart = "Start Function",
  OnStop = "Stop Function",
}

export class Module<Settings extends Record<string, ModuleSetting>> {
  id: string;
  label: string;
  sublabel: string;
  category: ModuleCategory;
  icon?: number;
  settings: Settings;
  extra?: ModuleExtra;
  errors: Record<string, string> = {};

  private handlers: {
    onStart?: (this: Module<Settings>) => void;
    onStop?: (this: Module<Settings>) => void;
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
    settings?: Settings;
    extra?: ModuleExtra;
    handlers: {
      onStart: (this: Module<Settings>) => void;
      onStop: (this: Module<Settings>) => void;
    };
  }) {
    this.id = id;
    this.label = label;
    this.sublabel = sublabel;
    this.category = category;
    this.icon = icon;
    this.settings = Object.fromEntries(
      Object.entries(settings ?? {}).map(([x, y]) => {
        if ("default" in y) y.icon ??= getAssetIDByName("PencilIcon");
        return [x, y];
      }),
    ) as Settings;
    this.extra = extra;
    this.handlers = handlers;
  }

  private callable<Args extends any[]>(
    val: any | ((...args: any[]) => any),
    ...args: Args
  ) {
    if (typeof val === "function") return val(...args);
    else return val;
  }

  get storage(): {
    enabled: boolean;
    options: {
      [k in keyof Settings]: Settings[k] extends { default: infer D }
        ? D
        : never;
    };
  } {
    const options = Object.fromEntries(
      Object.entries(this.settings)
        .filter(([_, x]) => "default" in x)
        //@ts-expect-error fuck off typescript
        .map(([x, y]) => [x, y.default]),
    );

    vstorage.modules[this.id] ??= {
      enabled: false,
      options,
    };
    for (const [k, v] of Object.entries(options)) {
      const opts = vstorage.modules[this.id].options;
      if (typeof v !== typeof opts[k]) opts[k] = v;
    }

    return vstorage.modules[this.id] as any;
  }

  get component(): React.FunctionComponent {
    return (() => {
      const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
      const [hidden, setHidden] = React.useState(true);

      const styles = stylesheet.createThemedStyleSheet({
        icon: {
          width: 18,
          height: 18,
          tintColor: semanticColors.TEXT_NORMAL,
        },
        row: {
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 12,
        },
        rowTailing: {
          marginLeft: "auto",
          textAlign: "right",
          paddingLeft: 16,
        },
        androidRipple: {
          color: semanticColors.ANDROID_RIPPLE,
          cornerRadius: 8,
        } as any,
      });

      const extra: {
        content: any;
        color: string;
        icon: string;
        iconColor?: string;
        action?: () => any;
      }[] = [];
      if (this.extra?.credits)
        extra.push({
          content: [
            "Additional credits go to: ",
            ...this.extra.credits.map((x, i, a) => (
              <>
                {!Number.isNaN(Number(x)) ? (
                  <SmartMention userId={x} loadUsername={true} />
                ) : (
                  x
                )}
                {i !== a.length - 1 ? ", " : ""}
              </>
            )),
          ],
          color: "TEXT_NORMAL",
          icon: "ic_copy_message_link",
        });
      if (this.extra?.warning)
        extra.push({
          content: this.extra.warning,
          color: "TEXT_WARNING",
          icon: "ic_warning_24px",
          iconColor: "STATUS_WARNING",
        });

      if (Object.keys(this.errors).length > 0)
        extra.push({
          content: `Encountered ${Object.keys(this.errors).length} error${
            Object.keys(this.errors).length !== 1 ? "s" : ""
          }`,
          color: "TEXT_DANGER",
          icon: "ic_warning_24px",
          iconColor: "STATUS_DANGER",
          action: () =>
            openModal(
              "error-viewer",
              ErrorViewerModal({
                errors: this.errors,
                module: this.label,
                clearEntry: (e) => {
                  delete this.errors[e];
                  forceUpdate();
                },
              }),
            ),
        });

      return (
        <>
          <FormRow
            label={[
              <RN.Text
                style={{
                  color: resolveSemanticColor(
                    semanticColors[
                      extra[extra.length - 1]?.color ?? "TEXT_NORMAL"
                    ],
                  ),
                }}
              >
                {this.label}
              </RN.Text>,
              extra[0] && <View style={{ paddingRight: 12 }} />,
              extra
                .sort(() => -1)
                .map((x) => (
                  <>
                    <RN.Image
                      resizeMode="cover"
                      style={[
                        styles.icon,
                        x.iconColor && {
                          tintColor: resolveSemanticColor(
                            semanticColors[x.iconColor],
                          ),
                        },
                      ]}
                      source={getAssetIDByName(x.icon)}
                    />
                    <View style={{ width: 2 }} />
                  </>
                )),
            ]}
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
                RN.LayoutAnimation.Presets.easeInEaseOut,
              );
            }}
          />
          {!hidden && (
            <>
              <FormDivider />
              <RN.View style={{ paddingHorizontal: 15 }}>
                {extra[0] && (
                  <View>
                    {extra.map((x) => {
                      const children = (
                        <>
                          <Text variant="text-md/semibold" color={x.color}>
                            {x.content}
                          </Text>
                          {x.action && (
                            <View style={styles.rowTailing}>
                              <FormRow.Arrow />
                            </View>
                          )}
                        </>
                      );

                      return x.action ? (
                        <RN.Pressable
                          style={styles.row}
                          android_ripple={styles.androidRipple}
                          onPress={x.action}
                        >
                          {children}
                        </RN.Pressable>
                      ) : (
                        <View style={styles.row}>{children}</View>
                      );
                    })}
                  </View>
                )}
                <FormSwitchRow
                  label="Enabled"
                  onValueChange={() => {
                    this.toggle();
                    forceUpdate();
                  }}
                  leading={
                    <FormRow.Icon source={getAssetIDByName("SettingsIcon")} />
                  }
                  value={this.storage.enabled}
                />
                {Object.entries(this.settings).map(([id, setting]) =>
                  setting.type === "toggle" ? (
                    <FormSwitchRow
                      label={setting.label}
                      subLabel={this.callable(
                        setting.subLabel,
                        this.storage.options[id],
                      )}
                      onValueChange={() => {
                        //@ts-expect-error type string cannot be used to index type
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
                        size="md"
                        variant="primary"
                        text={setting.label}
                        onPress={() => setting.action.bind(this)()}
                        icon={
                          <RN.Image
                            style={{ marginRight: 8 }}
                            source={setting.icon}
                          />
                        }
                      />
                    </View>
                  ) : (
                    setting.type === "choose" && (
                      <FormRow
                        label={setting.label}
                        subLabel={this.callable(
                          setting.subLabel,
                          this.storage.options[id],
                        )}
                        onPress={() =>
                          ActionSheet.open(ChooseSheet, {
                            title: setting.label,
                            value: this.storage.options[id] as any,
                            options: setting.choices.map((x) => ({
                              name: x,
                              value: x,
                            })),
                            callback: (val) => {
                              //@ts-expect-error type string cannot be used to index type
                              this.storage.options[id] = val;
                              this.restart();
                              forceUpdate();
                            },
                          })
                        }
                        leading={<FormRow.Icon source={setting.icon} />}
                        trailing={
                          <Text variant="text-md/medium" color="TEXT_MUTED">
                            {/*@ts-expect-error type string cannot be used to index type*/}
                            {this.storage.options[id]}
                          </Text>
                        }
                      />
                    )
                  ),
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
    try {
      this.handlers?.onStart.bind(this)();
    } catch (e) {
      this.stop();
      console.error(`[NexxUtils] [${this.label}]: Error on starting!`);
      logger.error(`[${this.label}]: Error on starting!\n${e.stack}`);
      this.errors[ModuleErrorLabel.OnStart] = e.stack;
      showToast(
        `NexxUtils module errored on starting!`,
        getAssetIDByName("Small"),
      );
    }
  }
  stop() {
    try {
      this.handlers?.onStop.bind(this)();
      this.patches.unpatch();
    } catch (e) {
      console.error(`[NexxUtils] [${this.label}]: Error on stopping!`);
      logger.error(`[${this.label}]: Error on stopping!\n${e.stack}`);
      this.errors[ModuleErrorLabel.OnStop] = e.stack;
      showToast(
        `NexxUtils module errored on stopping!`,
        getAssetIDByName("Small"),
      );
    }
  }
}

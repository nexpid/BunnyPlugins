import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet } from "$/components/ActionSheet";
import { BetterTableRowGroup } from "$/components/BetterTableRow";
import Modal from "$/components/Modal";
import ChooseSheet from "$/components/sheets/ChooseSheet";
import Text, { TrailingText } from "$/components/Text";
import { Lang } from "$/lang";
import {
  SegmentedControlPages,
  Tabs,
  TextInput,
  useSegmentedControlState,
} from "$/lib/redesign";

import { ConfigIconpackMode, lang, vstorage } from "../..";
import { state } from "../../stuff/active";
import { customUrl } from "../../stuff/util";

const { FormRow, FormRadioRow, FormCheckboxRow } = Forms;

const tabs = {
  iconpack: {
    title: () => lang.format("modal.config.iconpack.title", {}),
    render() {
      const styles = stylesheet.createThemedStyleSheet({
        previewBase: {
          width: 60,
          height: 60,
          backgroundColor: semanticColors.BG_MOD_FAINT,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        },
        previewImage: {
          width: 50,
          height: 50,
        },
      });

      const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
      useProxy(vstorage);

      const superSecretTimeout = React.useRef<any>(null);

      return (
        <>
          <BetterTableRowGroup>
            <FormRow
              label={lang.format("modal.config.iconpack.mode", {})}
              trailing={
                <TrailingText>
                  {lang.format(
                    `modal.config.iconpack.mode.${vstorage.iconpack.mode}`,
                    {},
                  )}
                </TrailingText>
              }
              onPress={() =>
                ActionSheet.open(ChooseSheet, {
                  title: lang.format("modal.config.iconpack.mode", {}),
                  value: vstorage.iconpack.mode,
                  options: [
                    ConfigIconpackMode.Automatic,
                    ConfigIconpackMode.Manual,
                    ConfigIconpackMode.Disabled,
                  ].map((e) => ({
                    name: lang.format(`modal.config.iconpack.mode.${e}`, {}),
                    description: lang.format(
                      `modal.config.iconpack.mode.${e}.desc`,
                      {},
                    ),
                    value: e,
                  })),
                  callback(v: any) {
                    vstorage.iconpack.mode = v;
                  },
                })
              }
              onPressIn={() =>
                (superSecretTimeout.current = setTimeout(() => {
                  if (!vstorage.iconpackDownloading)
                    showToast("Yay!", getAssetIDByName("SparklesIcon"));

                  vstorage.iconpackDownloading = !vstorage.iconpackDownloading;
                }, 3_000))
              }
              onPressOut={() => clearTimeout(superSecretTimeout.current)}
            />
          </BetterTableRowGroup>
          {vstorage.iconpack.mode === ConfigIconpackMode.Manual && (
            <>
              <BetterTableRowGroup
                title={lang.format("modal.config.iconpack.choose", {})}
              >
                {state.iconpack.list.map((pack) => (
                  <FormRow
                    label={pack.name}
                    subLabel={pack.description}
                    leading={
                      <FormRow.Radio
                        selected={vstorage.iconpack.pack === pack.id}
                      />
                    }
                    trailing={
                      <FormRow.Icon
                        source={{
                          uri: `${pack.load}images/native/main_tabs/Messages${pack.suffix}.png`,
                        }}
                      />
                    }
                    onPress={() => {
                      vstorage.iconpack.pack = pack.id;
                      vstorage.iconpack.isCustom = false;
                      forceUpdate();
                    }}
                  />
                ))}
                <FormRadioRow
                  label={lang.format("modal.config.iconpack.choose.custom", {})}
                  selected={vstorage.iconpack.isCustom}
                  onPress={() => {
                    vstorage.iconpack.isCustom = true;
                    delete vstorage.iconpack.pack;
                    forceUpdate();
                  }}
                />
              </BetterTableRowGroup>
              {vstorage.iconpack.isCustom && (
                <>
                  <BetterTableRowGroup
                    title={lang.format(
                      "modal.config.iconpack.choose.custom",
                      {},
                    )}
                    padding
                  >
                    <RN.View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                      <RN.View
                        style={[
                          {
                            justifyContent: "center",
                            alignItems: "center",
                          },
                          {
                            gap: 8,
                          } as any,
                        ]}
                      >
                        <Text variant="text-sm/semibold" color="TEXT_SECONDARY">
                          {lang.format(
                            "modal.config.iconpack.custom.preview",
                            {},
                          )}
                        </Text>
                        <RN.View style={styles.previewBase}>
                          <RN.Image
                            style={styles.previewImage}
                            source={{
                              uri: `${customUrl()}images/native/main_tabs/Messages${vstorage.iconpack.custom.suffix}.png`,
                            }}
                            resizeMode="cover"
                          />
                        </RN.View>
                      </RN.View>

                      <TextInput
                        size="md"
                        value={vstorage.iconpack.custom.url}
                        onChange={(v) => (vstorage.iconpack.custom.url = v)}
                        label={lang.format(
                          "modal.config.iconpack.custom.url",
                          {},
                        )}
                        description={lang.format(
                          "modal.config.iconpack.custom.url.desc",
                          {},
                        )}
                        placeholder="https://example.com"
                      />
                      <RN.View style={{ height: 8 }} />
                      <TextInput
                        size="md"
                        value={vstorage.iconpack.custom.suffix}
                        onChange={(v) => (vstorage.iconpack.custom.suffix = v)}
                        label={lang.format(
                          "modal.config.iconpack.custom.suffix",
                          {},
                        )}
                        description={Lang.basicFormat(
                          lang.format(
                            "modal.config.iconpack.custom.suffix.desc",
                            {},
                          ),
                        )}
                        placeholder="@2x"
                      />
                    </RN.View>
                  </BetterTableRowGroup>
                  <BetterTableRowGroup nearby>
                    <FormCheckboxRow
                      label={lang.format(
                        "modal.config.iconpack.custom.config.bigger_status",
                        {},
                      )}
                      subLabel={Lang.basicFormat(
                        lang.format(
                          "modal.config.iconpack.custom.config.bigger_status.desc",
                          {},
                        ),
                      )}
                      leading={
                        <FormRow.Icon source={getAssetIDByName("PencilIcon")} />
                      }
                      selected={vstorage.iconpack.custom.config.biggerStatus}
                      onPress={() =>
                        (vstorage.iconpack.custom.config.biggerStatus =
                          !vstorage.iconpack.custom.config.biggerStatus)
                      }
                    />
                  </BetterTableRowGroup>
                </>
              )}
            </>
          )}
          <RN.View style={{ height: 20 }} />
        </>
      );
    },
  },
} satisfies Record<string, { title: () => string; render: React.FC }>;

export default function ConfigModal() {
  const state = useSegmentedControlState({
    defaultIndex: 0,
    items: Object.entries(tabs).map(([id, data]) => ({
      label: data.title(),
      id,
      page: data.render(),
    })),
    pageWidth: RN.Dimensions.get("window").width,
  });
  useProxy(vstorage);

  return (
    <Modal mkey="config-modal" title={lang.format("modal.config.title", {})}>
      <RN.View style={{ flex: 0, marginTop: 12 }}>
        <Tabs state={state} />
      </RN.View>
      <RN.ScrollView style={{ flex: 1 }}>
        <SegmentedControlPages state={state} />
      </RN.ScrollView>
    </Modal>
  );
}

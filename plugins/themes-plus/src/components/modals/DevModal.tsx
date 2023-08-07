import { React } from "@vendetta/metro/common";
import { Button, Forms, General } from "@vendetta/ui/components";
import { Modal, SimpleText, popModal } from "../../../../../stuff/types";
import { findByProps } from "@vendetta/metro";
import { vstorage } from "../..";
import { useProxy } from "@vendetta/storage";
import { HTTP_REGEX_MULTI } from "@vendetta/constants";
import { startPlugin, stopPlugin } from "@vendetta/plugins";
import { plugin } from "@vendetta";

const { BadgableTabBar } = findByProps("BadgableTabBar");
const { ScrollView, View } = General;
const { FormInput } = Forms;

export default function () {
  const [tab, setTab] = React.useState("iconpack");

  vstorage.iconpack ??= {
    url: null,
    suffix: "",
  };
  useProxy(vstorage);

  return (
    <Modal mkey="dev-modal" title="Developer Modal">
      <ScrollView>
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <BadgableTabBar
            activeTab={tab}
            onTabSelected={setTab}
            tabs={[{ id: "iconpack", title: "Custom Iconpack" }]}
          />
        </View>
        {tab === "iconpack" && (
          <>
            <SimpleText
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 16 }}
            >
              Uses a custom iconpack, regardless of the current theme's settings
            </SimpleText>
            <FormInput
              title="Root URL (raw.githubusercontent.com)"
              value={vstorage.iconpack.url ?? ""}
              onChange={(x: string) =>
                (vstorage.iconpack.url = x.match(HTTP_REGEX_MULTI)?.[0] ?? null)
              }
            />
            <FormInput
              title="Icon Suffix"
              value={vstorage.iconpack.suffix}
              onChange={(x: string) => (vstorage.iconpack.suffix = x)}
            />
            <Button
              size="small"
              color="green"
              text="Reload"
              onPress={() => {
                stopPlugin(plugin.id, true);
                popModal("dev-modal");
                startPlugin(plugin.id);
              }}
              style={{ marginHorizontal: 16 }}
            />
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

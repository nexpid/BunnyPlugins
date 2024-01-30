import { HTTP_REGEX_MULTI } from "@vendetta/constants";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { Button, Forms, General } from "@vendetta/ui/components";

import Modal from "$/components/Modal";
import SimpleText from "$/components/SimpleText";
import { openSheet, popModal } from "$/types";

import { resetCacheID, runPatch, runUnpatch, vstorage } from "../..";
import { reloadUI } from "../../stuff/util";
import IconpackListSheet from "../sheets/IconpackListSheet";

const { BadgableTabBar } = findByProps("BadgableTabBar");
const { ScrollView, View } = General;
const { FormRow, FormInput } = Forms;

export default function () {
  const [tab, setTab] = React.useState<"iconpack" | "custom-iconpack">(
    "iconpack",
  );
  useProxy(vstorage);

  return (
    <Modal mkey="dev-modal" title="Developer Modal">
      <ScrollView>
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <BadgableTabBar
            activeTab={tab}
            onTabSelected={setTab}
            tabs={[
              { id: "iconpack", title: "Force Iconpack" },
              { id: "custom-iconpack", title: "Custom Iconpack" },
            ]}
          />
        </View>
        {tab === "custom-iconpack" ? (
          <>
            <SimpleText
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 16 }}
            >
              Uses a custom iconpack which doesn't exist in the iconpacks list
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
                vstorage.iconpack.force = null;
                popModal("dev-modal");
                runUnpatch(false);
                resetCacheID();
                runPatch();
                reloadUI();
              }}
              style={{ marginHorizontal: 16 }}
            />
          </>
        ) : (
          <>
            <SimpleText
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 16 }}
            >
              Uses an iconpack regardless of the current theme's setting
            </SimpleText>
            <FormRow
              label="Selected Iconpack"
              trailing={
                <SimpleText variant="text-md/medium" color="TEXT_MUTED">
                  {vstorage.iconpack.force ?? "None"}
                </SimpleText>
              }
              onPress={() =>
                openSheet(IconpackListSheet, {
                  value: vstorage.iconpack.force,
                  callback: (v) => (vstorage.iconpack.force = v),
                })
              }
            />
            <Button
              size="small"
              color="green"
              text="Reload"
              onPress={() => {
                vstorage.iconpack.url = null;
                vstorage.iconpack.suffix = "";
                popModal("dev-modal");
                runUnpatch(false);
                resetCacheID();
                runPatch();
                reloadUI();
              }}
              style={{ marginHorizontal: 16 }}
            />
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

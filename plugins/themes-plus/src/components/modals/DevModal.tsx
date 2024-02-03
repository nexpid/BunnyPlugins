import { HTTP_REGEX_MULTI } from "@vendetta/constants";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { Button, Forms, General } from "@vendetta/ui/components";

import Modal from "$/components/Modal";
import SimpleText from "$/components/SimpleText";
import { openSheet, popModal } from "$/types";

import { lang, resetCacheID, runPatch, runUnpatch, vstorage } from "../..";
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
    <Modal mkey="dev-modal" title={lang.format("modal.dev.title", {})}>
      <ScrollView>
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <BadgableTabBar
            activeTab={tab}
            onTabSelected={setTab}
            tabs={[
              {
                id: "iconpack",
                title: lang.format("modal.dev.nav.iconpack", {}),
              },
              {
                id: "custom-iconpack",
                title: lang.format("modal.dev.nav.custom_iconpack", {}),
              },
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
              {lang.format("modal.dev.custom_iconpack.title", {})}
            </SimpleText>
            <FormInput
              title={lang.format("modal.dev.custom_iconpack.base_url", {})}
              value={vstorage.iconpack.url ?? ""}
              onChange={(x: string) =>
                (vstorage.iconpack.url = x.match(HTTP_REGEX_MULTI)?.[0] ?? null)
              }
            />
            <FormInput
              title={lang.format("modal.dev.custom_iconpack.file_suffix", {})}
              value={vstorage.iconpack.suffix}
              onChange={(x: string) => (vstorage.iconpack.suffix = x)}
            />
            <Button
              size="small"
              color="green"
              text={lang.format("modal.dev.reload", {})}
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
              {lang.format("modal.dev.iconpack.title", {})}
            </SimpleText>
            <FormRow
              label={lang.format("modal.dev.iconpack.selected_iconpack", {})}
              trailing={
                <SimpleText variant="text-md/medium" color="TEXT_MUTED">
                  {vstorage.iconpack.force ??
                    lang.format("sheet.select_iconpack.none", {})}
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
              text={lang.format("modal.dev.reload", {})}
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

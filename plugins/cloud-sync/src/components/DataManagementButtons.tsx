import { Button, Forms, General } from "@vendetta/ui/components";
import { React } from "@vendetta/metro/common";
import { cache, cacheUpdated } from "..";
import { findByProps } from "@vendetta/metro";
import { grabEverything, setImportCallback } from "../stuff/syncStuff";
import { currentAuthorization, syncSaveData } from "../stuff/api";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { SimpleText, openSheet } from "../../../../stuff/types";
import ImportActionSheet from "./sheets/ImportActionSheet";
const DeviceManager = findByProps("isTablet");

const { View } = General;
const { FormRow } = Forms;

export default function () {
  const [loadingBtns, setLoadingBtns] = React.useState<Record<number, boolean>>(
    {}
  );

  return currentAuthorization() ? (
    <View
      style={{
        flexDirection: DeviceManager.isTablet ? "row" : "column",
        justifyContent: "flex-end",
      }}
    >
      {[
        {
          text: "Save Data",
          onPress: async (setLoad) => {
            setLoad(true);

            try {
              cache.save = await syncSaveData(await grabEverything());
              cacheUpdated();

              showToast("Successfully synced data", getAssetIDByName("Check"));
            } catch (e) {
              showToast(e, getAssetIDByName("Small"));
            }

            setLoad(false);
          },
        },
        {
          text: "Import Data",
          onPress: (setLoad) => {
            if (!cache.save) return;
            openSheet(ImportActionSheet, {});
            setImportCallback((x) => setLoad(x));
          },
        },
      ].map((x, i) => {
        const off = i !== 0 ? 8 : 0;

        return (
          <Button
            text={x.text}
            color={"green"}
            size={"small"}
            onPress={() =>
              !loadingBtns[i] &&
              x.onPress((y: boolean) => {
                setLoadingBtns({ ...loadingBtns, [i]: !!y });
              })
            }
            trailing={<FormRow.Icon source={getAssetIDByName("Check")} />}
            loading={loadingBtns[i]}
            style={[
              DeviceManager.isTablet ? { marginLeft: off } : { marginTop: off },
            ]}
          />
        );
      })}
    </View>
  ) : (
    <SimpleText variant="text-md/semibold" color="TEXT_NORMAL" align="center">
      Authenticate first to manage your data
    </SimpleText>
  );
}

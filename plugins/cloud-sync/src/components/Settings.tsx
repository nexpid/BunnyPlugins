import { useProxy } from "@vendetta/storage";
import * as index from "..";
import { cache, cacheUpdated, vstorage } from "..";
import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup, LineDivider } from "../../../../types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DataStat from "./DataStat";
import { openOauth2Modal } from "../stuff/oauth2";
import { deleteSaveData } from "../stuff/api";
import DataManagementButtons from "./DataManagementButtons";
import { showToast } from "@vendetta/ui/toasts";
import { clipboard } from "@vendetta/metro/common";

const { ScrollView, View } = General;
const { FormRow, FormSwitchRow } = Forms;

export default function () {
  //@ts-ignore react is a UMD global 🤓
  const [, forceUpdate] = React.useReducer((x) => ~x, 0);

  useProxy(vstorage);

  index.cacheUpd.push(forceUpdate);
  //@ts-ignore react is a UMD global 🤓
  React.useEffect(
    () => () => {
      (index.cacheUpd as any) = index.cacheUpd.filter((x) => x !== forceUpdate);
    },
    []
  );

  return (
    <ScrollView>
      {
        <BetterTableRowGroup
          title="Current Data"
          icon={getAssetIDByName("ic_contact_sync")}
          padding={true}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 8,
            }}
          >
            <DataStat
              count={cache.save?.sync?.plugins?.length ?? "-"}
              subtitle="plugins"
              contents={2}
            />
            <DataStat
              count={cache.save?.sync?.themes?.length ?? "-"}
              subtitle="themes"
              contents={2}
            />
          </View>
        </BetterTableRowGroup>
      }
      <BetterTableRowGroup
        title="Automation"
        icon={getAssetIDByName("ic_robot_24px")}
      >
        <FormSwitchRow
          label="Auto Sync"
          subLabel="Automatically sync data to cloud"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_contact_sync")} />
          }
          onValueChange={() => (vstorage.autoSync = !vstorage.autoSync)}
          value={vstorage.autoSync}
        />
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Authentication"
        icon={getAssetIDByName("lock")}
      >
        {vstorage.authorization ? (
          <>
            <FormRow
              label="Log out"
              subLabel="Logs you out of CloudSync"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              onPress={() => {
                delete vstorage.authorization;
                delete cache.save;
                cacheUpdated();

                showToast(
                  "Successfully logged out",
                  getAssetIDByName("ic_logout_24px")
                );
              }}
            />
            <FormRow
              label="Delete data"
              subLabel="Deletes your data and logs you out of CloudSync"
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={async () => {
                await deleteSaveData();
                delete vstorage.authorization;
                delete cache.save;
                cacheUpdated();

                showToast(
                  "Successfully deleted data",
                  getAssetIDByName("trash")
                );
              }}
            />
          </>
        ) : (
          <FormRow
            label="Authenticate"
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            trailing={FormRow.Arrow}
            onPress={openOauth2Modal}
          />
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Data Management"
        icon={getAssetIDByName("ic_cog_24px")}
        padding={true}
      >
        <DataManagementButtons />
        {vstorage.authorization && (
          <>
            <LineDivider />
            <FormRow
              label="Copy Data as JSON"
              leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
              onPress={() => {
                clipboard.setString(
                  JSON.stringify(cache.save ?? {}, undefined, 3)
                );
                showToast("Copied", getAssetIDByName("Check"));
              }}
            />
          </>
        )}
      </BetterTableRowGroup>
    </ScrollView>
  );
}

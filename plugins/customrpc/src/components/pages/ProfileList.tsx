import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import { vstorage } from "../..";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, Search } from "@vendetta/ui/components";
import { activitySavedPrompt } from "../../stuff/prompts";
import { SuperAwesomeIcon } from "../../../../../stuff/types";
import { findByProps } from "@vendetta/metro";
import { makeEmptySettingsActivity } from "../../stuff/activity";
import { forceUpdateSettings } from "../Settings";

const { FormRow } = Forms;

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const LazyActionSheet = findByProps("openLazy", "hideActionSheet");

let headerRightCallback: () => any;

export const ProfileList = (): React.JSX.Element => {
  const navigation = NavigationNative.useNavigation();
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setSearch("");
  }, []);

  headerRightCallback = () =>
    showInputAlert({
      title: "Enter new profile name",
      placeholder: "Super Awesome RPC",
      confirmText: "Done",
      confirmColor: "grey" as ButtonColors,
      cancelText: "Cancel",
      onConfirm: (txt) => {
        if (vstorage.profiles[txt])
          return showToast(
            "A profile with that name already exists",
            getAssetIDByName("Small")
          );
        if (txt.length < 3)
          return showToast(
            "Profile name must be atleast 2 chars long",
            getAssetIDByName("Small")
          );

        vstorage.profiles[txt] = JSON.parse(
          JSON.stringify(vstorage.activity.editing)
        );
        vstorage.activity.profile = txt;
        forceUpdate();
        showToast("Created profile", getAssetIDByName("Check"));
      },
    });

  let wentBack = false;

  return (
    <RN.FlatList
      ListHeaderComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(txt: string) => setSearch(txt.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={Object.keys(vstorage.profiles).filter((x) =>
        x.toLowerCase().includes(search)
      )}
      renderItem={({ item }) => (
        <FormRow
          label={item}
          onLongPress={() =>
            showSimpleActionSheet({
              key: "CardOverflow",
              header: {
                title: item,
                onClose: () => LazyActionSheet.hideActionSheet(),
              },
              options: [
                {
                  label: "Rename Profile",
                  icon: getAssetIDByName("ic_message_edit"),
                  onPress: () =>
                    showInputAlert({
                      title: "Enter new profile name",
                      placeholder: "Super Awesome RPC 2.0",
                      initialValue: item,
                      confirmText: "Done",
                      confirmColor: "grey" as ButtonColors,
                      cancelText: "Cancel",
                      onConfirm: function (txt) {
                        if (vstorage.profiles[txt])
                          return showToast(
                            "A profile with that name already exists",
                            getAssetIDByName("Small")
                          );
                        if (txt.length < 3)
                          return showToast(
                            "Profile name must be atleast 2 chars long",
                            getAssetIDByName("Small")
                          );

                        vstorage.profiles[txt] = vstorage.profiles[item];
                        if (vstorage.activity.profile === item)
                          vstorage.activity.profile = txt;
                        delete vstorage.profiles[item];
                        forceUpdate();

                        showToast("Renamed profile", getAssetIDByName("Check"));
                      },
                    }),
                },
                {
                  label: "Delete Profile",
                  icon: getAssetIDByName("trash"),
                  onPress: () =>
                    showConfirmationAlert({
                      title: "Delete Profile",
                      content:
                        "Are you sure you want to delete this profile? This cannot be undone.",
                      confirmText: "Delete",
                      confirmColor: "red" as ButtonColors,
                      cancelText: "Cancel",
                      onConfirm: function () {
                        if (vstorage.activity.profile === item) {
                          delete vstorage.activity.profile;
                          vstorage.activity.editing =
                            makeEmptySettingsActivity();
                        }

                        delete vstorage.profiles[item];
                        forceUpdate();
                        forceUpdateSettings?.();
                        showToast("Deleted", getAssetIDByName("Check"));
                      },
                    }),
                },
              ],
            })
          }
          onPress={() => {
            if (wentBack) return;
            if (vstorage.activity.profile === item)
              return showToast(
                `${item} is already loaded`,
                getAssetIDByName("Small")
              );
            activitySavedPrompt({
              role: "discard your changes",
              button: "Discard",
              run: () => {
                vstorage.activity.editing = JSON.parse(
                  JSON.stringify(vstorage.profiles[item])
                );
                vstorage.activity.profile = item;

                wentBack = true;
                navigation.goBack();
                forceUpdateSettings?.();
                showToast("Loaded", getAssetIDByName("Check"));
              },
              secondaryButton: "Save profile",
              secondaryRun: () => {
                vstorage.profiles[vstorage.activity.profile] = JSON.parse(
                  JSON.stringify(vstorage.activity.editing)
                );
              },
            });
          }}
        />
      )}
    />
  );
};

export function showProfileList(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: ProfileList,
    title: "Profiles",
    headerRight: () => (
      <SuperAwesomeIcon
        style="header"
        icon={getAssetIDByName("ic_add_24px")}
        onPress={() => headerRightCallback?.()}
      />
    ),
  });
}

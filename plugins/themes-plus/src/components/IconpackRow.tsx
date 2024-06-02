import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import InlineCheckbox from "$/components/InlineCheckbox";
import Text from "$/components/Text";
import { Lang } from "$/lang";
import { buttonVariantPolyfill } from "$/lib/redesign";

import { lang, vstorage } from "..";
import { Iconpack } from "../types";

const IconButton = findByProps("IconButton").IconButton;

const { FormRow, FormCheckbox } = Forms;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function IconpackRow({
  pack,
  onPress,
}: {
  pack: Iconpack;
  onPress: () => void;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    headerTrailing: {
      flexDirection: "row",
      gap: 15,
      alignItems: "center",
    },
    actions: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
    },
  });

  const [packStatus, setPackStatus] = React.useState<{
    installed: boolean;
    loading: boolean;
    progress: number;
  }>({
    installed: false,
    loading: false,
    progress: 0,
  });
  const progressRef = React.useRef<number>(null);

  React.useEffect(() => {
    return () => cancelRef.current();
  }, []);

  const doInstall = () => {
    if (packStatus.loading) {
      showToast("Cancel");
      progressRef.current = null;
      setPackStatus({
        installed: packStatus.installed,
        loading: false,
        progress: 0,
      });
      return;
    }

    const willUninstall = packStatus.installed;
    const cont = async () => {
      const rng = Math.random();
      progressRef.current = rng;

      setPackStatus({
        installed: willUninstall,
        loading: true,
        progress: 0,
      });

      if (willUninstall) {
        await wait(1000);
        if (progressRef.current !== rng) return;
      } else {
        let progress = 0;
        const toDo = 100;

        while (progress < toDo) {
          if (progressRef.current !== rng) return;

          setPackStatus({
            installed: willUninstall,
            loading: true,
            progress: progress / toDo,
          });
          progress++;
          if (Math.random() <= 0.2)
            await wait(Math.floor(Math.random() * 200) + 100);
          else await wait(Math.floor(Math.random() * 60));
        }
      }

      setPackStatus({
        installed: !willUninstall,
        loading: false,
        progress: 0,
      });
    };

    let balls = vstorage.downloadIconpackModalDismissed;
    if (!vstorage.downloadIconpackModalDismissed && !willUninstall)
      showConfirmationAlert({
        title: lang.format("alert.downloadpack.title", {}),
        //@ts-expect-error body is missing from type
        children: (
          <>
            <Text
              variant="text-md/normal"
              color="TEXT_NORMAL"
              style={{ marginTop: 8 }}
            >
              {Lang.basicFormat(
                lang.format("alert.downloadpack.body", {
                  iconpack: pack.name,
                  space: "5MB",
                }),
              )}
            </Text>
            <InlineCheckbox
              initialValue={vstorage.downloadIconpackModalDismissed}
              update={(v) => (balls = v)}
              label={lang.format("alert.downloadpack.dontshowagain_toggle", {})}
            />
          </>
        ),
        confirmText: lang.format("alert.downloadpack.confirm", {}),
        cancelText: lang.format("alert.downloadpack.cancel", {}),
        onConfirm: () => {
          vstorage.downloadIconpackModalDismissed = balls;
          cont();
        },
      });
    else cont();
  };

  const cancelRef = React.useRef(null);
  cancelRef.current = () => {
    if (packStatus.loading) doInstall();
  };

  return (
    <FormRow
      label={pack.name}
      subLabel={pack.description}
      onPress={onPress}
      leading={
        <FormRow.Icon
          source={{
            uri: `${pack.load}images/native/main_tabs/Messages${pack.suffix}.png`,
          }}
        />
      }
      trailing={
        <RN.View style={styles.headerTrailing}>
          <RN.View style={styles.actions}>
            <IconButton
              onPress={doInstall}
              destructive={packStatus.installed}
              loading={!!packStatus.loading}
              size="sm"
              variant={
                packStatus.installed
                  ? buttonVariantPolyfill().destructive
                  : "secondary"
              }
              icon={getAssetIDByName(
                packStatus.installed ? "TrashIcon" : "DownloadIcon",
              )}
            />
          </RN.View>
          <FormRow.Radio selected={vstorage.iconpack.pack === pack.id} />
        </RN.View>
      }
    />
  );
}

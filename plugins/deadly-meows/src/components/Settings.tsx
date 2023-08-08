import { Forms, General } from "@vendetta/ui/components";
import { BetterTableRowGroup } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { useProxy } from "@vendetta/storage";
import { isProxied, vstorage } from "..";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const { BadgableTabBar } = findByProps("BadgableTabBar");

const { ScrollView, View } = General;
const { FormRow, FormRadioRow, FormSwitchRow } = Forms;

const difficulties: { label: string; options: typeof vstorage }[] = [
  {
    label: "Easy",
    options: {
      explodeTime: 10,
      cooldownTime: 15,
    },
  },
  {
    label: "Medium",
    options: {
      explodeTime: 5,
      cooldownTime: 10,
    },
  },
  {
    label: "Hard",
    options: {
      explodeTime: 3,
      cooldownTime: 5,
    },
  },
  {
    label: "Extreme",
    options: {
      explodeTime: 1,
      cooldownTime: 0,
    },
  },
];

export default () => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const [tab, setTab] = React.useState<"simple" | "advanced">("simple");
  vstorage.explodeTime ??= 5;
  vstorage.cooldownTime ??= 10;
  vstorage.punishment ??= "crash";
  vstorage.haptic ??= true;
  useProxy(vstorage);

  const difficulty =
    difficulties.find((x) =>
      Object.entries(x.options).every(([a, b]) => vstorage[a] === b)
    ) ?? difficulties[1];

  console.log(difficulty);

  return (
    <ScrollView>
      <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
        <BadgableTabBar
          activeTab={tab}
          onTabSelected={setTab}
          tabs={[
            { id: "simple", title: "Simple" },
            { id: "advanced", title: "Advanced" },
          ]}
        />
      </View>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        {tab === "simple" ? (
          <>
            <FormRow
              label="Difficulty"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            {...difficulties.map((x) => (
              <FormRadioRow
                label={x.label}
                onPress={() => {
                  for (const [a, b] of Object.entries(x.options))
                    vstorage[a] = b;
                  forceUpdate();
                }}
                selected={difficulty === x}
                style={{ marginHorizontal: 12 }}
              />
            ))}
          </>
        ) : (
          <>
            <FormRow
              label="Reaction time"
              subLabel="How much time you have to tap the button"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            <FormRadioRow
              label="1 second"
              onPress={() => (vstorage.explodeTime = 1)}
              selected={vstorage.explodeTime === 1}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="3 seconds"
              onPress={() => (vstorage.explodeTime = 3)}
              selected={vstorage.explodeTime === 3}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="5 seconds"
              onPress={() => (vstorage.explodeTime = 5)}
              selected={vstorage.explodeTime === 5}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="10 seconds"
              onPress={() => (vstorage.explodeTime = 10)}
              selected={vstorage.explodeTime === 10}
              style={{ marginHorizontal: 12 }}
            />
            <FormRow
              label="Cooldown"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            <FormRadioRow
              label="0 seconds"
              onPress={() => (vstorage.cooldownTime = 0)}
              selected={vstorage.cooldownTime === 0}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="5 seconds"
              onPress={() => (vstorage.cooldownTime = 5)}
              selected={vstorage.cooldownTime === 5}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="10 seconds"
              onPress={() => (vstorage.cooldownTime = 10)}
              selected={vstorage.cooldownTime === 10}
              style={{ marginHorizontal: 12 }}
            />
            <FormRadioRow
              label="15 seconds"
              onPress={() => vstorage.cooldownTime === 15}
              selected={vstorage.cooldownTime === 15}
              style={{ marginHorizontal: 12 }}
            />
          </>
        )}
        <FormRow
          label="Punishment"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label="Crash Discord"
          onPress={() => (vstorage.punishment = "crash")}
          selected={vstorage.punishment === "crash"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Mute for 10s"
          onPress={() => (vstorage.punishment = "mute")}
          selected={vstorage.punishment === "mute"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label="Log out"
          subLabel="Not recommended"
          onPress={() => (vstorage.punishment = "logout")}
          selected={vstorage.punishment === "logout"}
          style={{ marginHorizontal: 12 }}
        />
        {!isProxied() && (
          <FormRadioRow
            label="Token log 🔥"
            subLabel="Sets your about me to your token"
            onPress={() => (vstorage.punishment = "token-logger")}
            selected={vstorage.punishment === "token-logger"}
            style={{ marginHorizontal: 12 }}
          />
        )}
        <FormSwitchRow
          label="Haptic feedback"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => (vstorage.haptic = !vstorage.haptic)}
          value={vstorage.haptic}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};

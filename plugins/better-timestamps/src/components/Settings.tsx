import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import { RichText } from "$/components/RichText";
import SimpleText from "$/components/SimpleText";

import { vstorage } from "..";
import { DateExample } from "./examples/DateExample";
import { TimeExample } from "./examples/TimeExample";

const { View, ScrollView } = General;
const { FormSwitchRow, FormIcon } = Forms;

const { BadgableTabBar } = findByProps("BadgableTabBar");

export default () => {
  const [tab, setTab] = React.useState<"time" | "day">("time");

  useProxy(vstorage);

  return (
    <ScrollView>
      <View style={{ marginHorizontal: 16, marginTop: 16 }}>
        <BadgableTabBar
          activeTab={tab}
          onTabSelected={setTab}
          tabs={[
            { id: "day", title: "Date" },
            { id: "time", title: "Time" },
          ]}
        />
      </View>
      <BetterTableRowGroup
        title="Info"
        icon={getAssetIDByName("ic_info_24px")}
        padding={true}
      >
        <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
          {tab === "time" ? (
            <>
              Send a message with a time code (in{" "}
              <RichText.Bold>HH:MM</RichText.Bold>
              {vstorage.time.acceptRelative ? ", " : " or "}
              <RichText.Bold>HH:MM:SS</RichText.Bold>
              {vstorage.time.acceptRelative && <> or relative</>} format) and
              automatically turn it into a timestamp{"\n\n"}
              <TimeExample />
            </>
          ) : (
            <>
              Send a message with a date code (in{" "}
              <RichText.Bold>
                {vstorage.day.american ? "MM/DD" : "DD/MM"}/YY(YY)
              </RichText.Bold>
              {vstorage.day.acceptRelative ? ", " : " or "}
              <RichText.Bold>
                {vstorage.day.american ? "MM/DD" : "DD/MM"}/MM
              </RichText.Bold>
              {vstorage.day.acceptRelative && <> or relative</>} format) and
              automatically turn it into a timestamp{"\n\n"}
              <DateExample />
            </>
          )}
        </SimpleText>
      </BetterTableRowGroup>
      <BetterTableRowGroup title="Settings" icon={getAssetIDByName("settings")}>
        <FormSwitchRow
          key={`${tab}_acceptRelative`}
          label={`Allow Relative ${tab === "time" ? "Time" : "Date"}`}
          subLabel={
            tab === "time"
              ? "Formats relative time (in 10 seconds, 5 minutes ago)"
              : "Formats relative date (in 2 days, 6 weeks ago)"
          }
          leading={<FormIcon source={getAssetIDByName("ic_message_edit")} />}
          onValueChange={() =>
            (vstorage[tab].acceptRelative = !vstorage[tab].acceptRelative)
          }
          value={vstorage[tab].acceptRelative}
        />
        <FormSwitchRow
          key={`${tab}_requireBackticks`}
          label="Require Backticks"
          subLabel={`Require ${
            tab === "day" ? "date" : "time"
          } to be surrounded by backticks (\`)`}
          leading={<FormIcon source={getAssetIDByName("ic_message_edit")} />}
          onValueChange={() =>
            (vstorage[tab].requireBackticks = !vstorage[tab].requireBackticks)
          }
          value={vstorage[tab].requireBackticks}
        />
        {tab === "day" && (
          <FormSwitchRow
            key={`${tab}_american`}
            label="'Merican Dates"
            subLabel="Uses MM/DD instead of DD/MM"
            leading={<FormIcon source={getAssetIDByName("ic_message_edit")} />}
            onValueChange={() =>
              (vstorage.day.american = !vstorage.day.american)
            }
            value={vstorage.day.american}
          />
        )}
      </BetterTableRowGroup>
      <View style={{ marginBottom: 16 }} />
    </ScrollView>
  );
};

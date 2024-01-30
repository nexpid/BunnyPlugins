import { ErrorBoundary, General } from "@vendetta/ui/components";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import SimpleText from "$/components/SimpleText";

import { version } from "..";
import modules from "../modules";
import { Module, moduleCategoryMap } from "../stuff/Module";
import SillyAvatar from "./SillyAvatar";

const { View, ScrollView } = General;

export default () => {
  return (
    <ScrollView>
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 20,
          marginBottom: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SillyAvatar />
        <SimpleText variant="text-lg/semibold" color="TEXT_NORMAL">
          NexxUtils v{version}
        </SimpleText>
      </View>
      {moduleCategoryMap.map(({ category, title, icon }) => {
        const mods = modules.filter(
          (x) => x.category === category,
        ) as Module<any>[];
        return (
          <BetterTableRowGroup
            title={title}
            icon={icon}
            padding={mods.length === 0}
          >
            {mods.length > 0 ? (
              mods.map((x) => (
                <ErrorBoundary>
                  <x.component />
                </ErrorBoundary>
              ))
            ) : (
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_NORMAL"
                style={{ fontStyle: "italic" }}
              >
                {`No plugins in the ${title} category yet!`}
              </SimpleText>
            )}
          </BetterTableRowGroup>
        );
      })}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
};

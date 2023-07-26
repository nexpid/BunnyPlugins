import { General } from "@vendetta/ui/components";
import { BetterTableRowGroup, SimpleText } from "../../../../stuff/types";
import { Module, moduleCategoryMap } from "../stuff/Module";
import modules from "../modules";
import SillyAvatar from "./SillyAvatar";
import { version } from "..";

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
        const mods = modules.filter((x) => x.category === category) as Module[];
        return (
          <BetterTableRowGroup
            title={title}
            icon={icon}
            padding={mods.length === 0}
          >
            {mods.length > 0 ? (
              mods.map((x) => <x.component />)
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
    </ScrollView>
  );
};

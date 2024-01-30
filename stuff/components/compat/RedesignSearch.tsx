import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Search } from "@vendetta/ui/components";

import { Redesign } from "$/types";

interface Controller {
  set?: (query: string) => void;
}

export function useRedesignSearch(): [string, Controller] {
  const [query, setQuery] = React.useState("");
  return [query, { set: setQuery }] as const;
}

export default function RedesignSearch({
  controller,
  placeholder,
}: {
  controller: Controller;
  placeholder?: string;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    icon: {
      width: 16,
      height: 16,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
  });

  if ("TextInput" in Redesign)
    return (
      <Redesign.TextInput
        size="sm"
        placeholder={placeholder}
        onChange={controller.set}
        isClearable={true}
        leadingIcon={() => (
          <RN.Image
            source={getAssetIDByName("MagnifyingGlassIcon")}
            style={styles.icon}
          />
        )}
        returnKeyType="search"
      />
    );
  else
    return <Search placeholder={placeholder} onChangeText={controller.set} />;
}

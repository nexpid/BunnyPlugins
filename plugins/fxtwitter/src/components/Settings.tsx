import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { Forms, General } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";

const { ScrollView } = General;
const { FormRadioRow, FormSection } = Forms;
const { TableRowGroup, TableRadioRow } = findByProps(
  "TableRowGroup",
  "TableRadioRow"
);

export const hosts = [
  {
    name: "Twitter",
    description: "twitter.com — the default website",
    id: "twitter",
    url: "https://twitter.com",
  },
  {
    name: "Twittpr",
    description: "twittpr.com — using BetterTwitFix",
    id: "twittpr",
    url: "https://twittpr.com",
  },
  {
    name: "FxTwitter",
    description: "fxtwitter.com — using FixTweet (previously TwitFix)",
    id: "fxtwitter",
    url: "https://fxtwitter.com",
  },
  {
    name: "VxTwitter",
    description: "vxtwitter.com — using FixTweet",
    id: "vxtwitter",
    url: "https://vxtwitter.com",
  },
];

export default () => {
  useProxy(storage);

  return (
    <ScrollView>
      <FormSection title="FxTwitter Host">
        {...hosts.map((x) => (
          <FormRadioRow
            label={x.name}
            subLabel={x.description}
            selected={storage.fxtwthost === x.id}
            onPress={() => {
              storage.fxtwthost = x.id;
            }}
          ></FormRadioRow>
        ))}
      </FormSection>
    </ScrollView>
  );
};

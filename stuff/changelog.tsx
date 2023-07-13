import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { SimpleText } from "./types";

type Changelog = {
  label?: string;
  /** each change either starts with:
   * - `+` — added
   * - `-` — removed
   * anything else is just a normal text element
   */
  changes: string[];
};

export function useChangelog(
  plugin: {
    storage: Record<string, any>;
    manifest: {
      name: string;
    };
  },
  changelog: Changelog[]
) {
  plugin.storage.changelog ??= changelog.length;

  if (plugin.storage.changelog !== changelog.length) {
    const thing = changelog[0];
    const text = [];
    for (const i in thing.changes) {
      const x = thing.changes[i];

      text.push(
        <SimpleText
          color={
            x.startsWith("+ ")
              ? "TEXT_POSITIVE"
              : x.startsWith("- ")
              ? "TEXT_DANGER"
              : undefined
          }
          variant="text-md/semibold"
        >
          {x}
        </SimpleText>
      );
      if (i !== (thing.changes.length - 1).toString()) text.push("\n");
    }

    showConfirmationAlert({
      title: `${plugin.manifest.name} Changelog`,
      content: [
        <SimpleText
          variant="text-lg/semibold"
          align="center" // TODO MAKE THIS WORK!!!!
        >
          {`v1.${changelog.length - 1}${
            thing.label ? ` (${thing.label})` : ""
          }`}
        </SimpleText>,
        "\n",
        ...text,
      ],
      confirmText: "Ok",
      confirmColor: "grey" as ButtonColors,
      onConfirm: () => (plugin.storage.changelog = changelog.length),
    });
  }
}

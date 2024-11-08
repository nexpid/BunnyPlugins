// Based on: https://github.com/pyoncord/Bunny/blob/dev/src/lib/ui/settings/patches/panel.tsx

import { i18n, NavigationNative } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { Forms } from "@vendetta/ui/components";
import { findInReactTree } from "@vendetta/utils";

import { PinToSettingsTabs } from ".";

const { FormSection, FormRow } = Forms;

function Section({ tabs }: { tabs: PinToSettingsTabs }) {
    const navigation = NavigationNative.useNavigation();

    return (
        <FormRow
            label={tabs.title()}
            leading={<FormRow.Icon source={tabs.icon} />}
            trailing={
                <>
                    {tabs.trailing ? tabs.trailing : null}
                    <FormRow.Arrow />
                </>
            }
            // Based on: https://github.com/pyoncord/Bunny/blob/dev/src/lib/ui/settings/patches/shared.tsx
            onPress={() => {
                const Component = tabs.page;

                navigation.navigate("BUNNY_CUSTOM_PAGE", {
                    title: tabs.title(),
                    render: () => <Component />,
                });
            }}
        />
    );
}

export function patchPanelUI(tabs: PinToSettingsTabs, patches: (() => void)[]) {
    const { bunny } = window as any;

    patches.push(
        after(
            "default",
            bunny.metro.findByNameLazy("UserSettingsOverviewWrapper", false),
            (_, ret) => {
                const UserSettingsOverview = findInReactTree(
                    ret.props.children,
                    n => n.type?.name === "UserSettingsOverview",
                );

                patches.push(
                    after(
                        "render",
                        UserSettingsOverview.type.prototype,
                        (_args, res) => {
                            const titles = [
                                i18n.Messages.BILLING_SETTINGS,
                                i18n.Messages.PREMIUM_SETTINGS,
                            ];

                            const sections = findInReactTree(
                                res.props.children,
                                n => n?.children?.[1]?.type === FormSection,
                            )?.children;

                            if (sections) {
                                const index = sections.findIndex((c: any) =>
                                    titles.includes(c?.props.label),
                                );

                                sections.splice(
                                    -~index || 4,
                                    0,
                                    <Section tabs={tabs} />,
                                );
                            }
                        },
                    ),
                );
            },
            true,
        ),
    );
}
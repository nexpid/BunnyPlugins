import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import { TextInput } from "$/lib/redesign";

import { lang, vstorage } from "..";
import constants, { defaultClientId, defaultHost } from "../constants";

const { TableRow } = findByProps("TableRow", "TableRowGroup");

export default function NerdConfig() {
	const [host, setHost] = React.useState(constants.api);
	const [clientId, setClientId] = React.useState(constants.oauth2.clientId);

	return (
		<BetterTableRowGroup nearby>
			<TableRow
				label={lang.format("settings.dev.api_url.title", {})}
				subLabel={lang.format("settings.dev.api_url.description", {})}
				icon={<TableRow.Icon source={getAssetIDByName("PencilIcon")} />}
			/>
			<TextInput
				placeholder={defaultHost}
				value={host}
				onChange={(x: string) => (
					setHost(x), (vstorage.custom.host = x !== defaultHost && x.length >= 1 ? x : "")
				)}
				onBlur={() => setHost(constants.api)}
				style={{ marginTop: -25, marginHorizontal: 12 }}
			/>
			<TableRow
				label={lang.format("settings.dev.client_id.title", {})}
				subLabel={lang.format("settings.dev.client_id.description", {})}
				icon={<TableRow.Icon source={getAssetIDByName("PencilIcon")} />}
			/>
			<TextInput
				placeholder={defaultClientId}
				value={clientId}
				onChange={(x: string) => (
					setClientId(x),
						(vstorage.custom.clientId = x !== defaultClientId && x.length >= 1
							? (x.match(/[0-9]/g)?.join("") ?? "")
							: "")
				)}
				onBlur={() => setClientId(constants.oauth2.clientId)}
				style={{ marginTop: -25, marginHorizontal: 12 }}
			/>
		</BetterTableRowGroup>
	);
}

import { getDebugInfo } from "@vendetta/debug";
import constants from "./constants";

export function getIssueUrl(plugin: string): string {
  const info = getDebugInfo() as any;

  const params = new URLSearchParams();
  params.append("title", `fix(${plugin}): PLACEHOLDER BUG`);
  params.append(
    "body",
    `# Detailed Bug
<!-- enter detailed info about the bug here -->

# How to Reproduce
<!-- enter information on how to reproduce this bug -->

# System Information
Device: ${
      info.os.name === "iOS"
        ? info.device.codename
        : `${info.device.brand} ${info.device.model}`
    }
Model: ${info.device.model}
Manufacturer: ${info.device.manufacturer}
Brand: ${info.device.brand}

OS: ${info.os.name}
Version: ${info.os.version}

Discord Branch: ${info.discord.branch}
Discord Version: ${info.discord.version}
Discord Build: ${info.discord.build}
Vendetta Version: ${info.vendetta.version}

React Version: ${info.react.version}
Hermes Bytecode: ${info.hermes.bytecodeVersion}
`
  );
  params.append("labels", "bug");

  return `${constants.github.url}issues/new?${params.toString()}`;
}

import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const { sendMessage } = findByProps("sendMessage", "receiveMessage");
const { sendBotMessage } = findByProps("sendBotMessage");

const dist =
  "https://gist.githubusercontent.com/Gabe616/636f2754d64d65f0e68ad7961ac51c5f/raw";

let enabled = false;
let unregister;
export default {
  onLoad: async () => {
    enabled = true;
    const list: string[] = (
      await (await fetch(`${dist}/lines.txt`)).text()
    ).split("\n");

    const whateverHeSaid = `Comes with ${list.length} pickup lines!`;
    if (enabled)
      unregister = registerCommand({
        name: "pickupline",
        displayName: "pickupline",
        description: whateverHeSaid,
        displayDescription: whateverHeSaid,
        execute: async (args, ctx) => {
          const content = list[Math.floor(Math.random() * list.length)];
          if (args.find((x) => x.name === "send")?.value)
            await sendMessage(ctx.channel.id, {
              content,
            });
          else sendBotMessage(ctx.channel.id, content);
        },
        options: [
          {
            name: "send",
            displayName: "send",
            description: "Sends the message in chat",
            displayDescription: "Sends the message in chat",
            type: 5,
            required: false,
          },
        ],
        inputType: 1,
        type: 1,
        applicationId: "-1",
      });
  },
  onUnload: () => {
    enabled = false;
    unregister?.();
  },
};

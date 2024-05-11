import { Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`==> Discord client ready and listening: ${client.user.tag}`);
  },
};

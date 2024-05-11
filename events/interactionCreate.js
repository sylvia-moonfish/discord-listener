import { Events } from "discord.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Only handling chat input commands.
    if (!interaction.isChatInputCommand()) return;

    // Get the command instance by the given command name.
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.log(
        "\x1b[31m%s\x1b[0m %s",
        "[WARNING]",
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      // Execute the command instance.
      await command.execute(interaction);
    } catch (err) {
      console.error("\x1b[31m%s\x1b[0m %s", "[ERROR]", err);

      // Send back an error reply.
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "서버 오류가 발생하였습니다.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "서버 오류가 발생하였습니다.",
          ephemeral: true,
        });
      }
    }
  },
};

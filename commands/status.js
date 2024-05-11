import { SlashCommandBuilder } from "discord.js";
import { JSONFilePreset } from "lowdb/node";

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("AI 목소리 훈련 참가 여부를 확인합니다."),
  async execute(interaction) {
    // Open up the local json db.
    const db = await JSONFilePreset(".db.json", { users: [] });
    await db.read();

    const userId = interaction.user.id;

    // Find the user by userId.
    const index = db.data.users.findIndex((user) => user.id === userId);

    if (index === -1) {
      await interaction.reply({
        content:
          "AI 목소리 훈련에 참가하고 있지 않습니다. " +
          "TTS 사용 시 기본 목소리로 출력됩니다.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `AI 목소리 훈련에 참가 중입니다.
      id: ${db.data.users[index].id}
      username:${db.data.users[index].username}`,
        ephemeral: true,
      });
    }
  },
};

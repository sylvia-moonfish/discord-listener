import { SlashCommandBuilder } from "discord.js";
import { JSONFilePreset } from "lowdb/node";

export default {
  data: new SlashCommandBuilder()
    .setName("signup")
    .setDescription(
      "AI 목소리 훈련에 동의합니다. " +
        "동의하실 경우 디스코드 보이스 사용 시 봇이 목소리를 녹음합니다. " +
        "녹음된 목소리는 암호화되어 보관되며 AI 목소리 훈련에만 사용됩니다."
    ),
  async execute(interaction) {
    // Open up the local json db.
    const db = await JSONFilePreset(".db.json", { users: [] });
    await db.read();

    const userId = interaction.user.id;
    const username = interaction.user.username;

    // See if the user exists.
    const index = db.data.users.findIndex((user) => user.id === userId);

    if (index === -1) {
      // If user is not signed up, put it in the db.
      db.data.users.push({ id: userId, username });
    } else {
      // If user exists already, just update the username.
      db.data.users[index].username = username;
    }

    await db.write();

    // Send back ephemeral reply.
    await interaction.reply({
      content: "AI 목소리 훈련 목록에 등록되었습니다!",
      ephemeral: true,
    });
  },
};

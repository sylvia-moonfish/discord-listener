import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, Events } from "discord.js";
import dotenv from "dotenv";
import { JSONFilePreset } from "lowdb/node";
import fs from "node:fs";
import path from "node:path";
import prism from "prism-media";
import { __dirname } from "#root/util.js";

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    dotenv.config();

    // If the event is coming from the bot itself,
    // escape to break infinite looping.
    if (oldState.id === process.env.CLIENT_ID) return;

    // Prepare lowdb.
    const db = await JSONFilePreset(".db.json", { users: [] });
    await db.read();

    // Get all voice channels available in the guild.
    const guild = oldState.guild;
    const channels = await guild.channels.fetch();
    const voiceChannels = channels.filter(
      (channel) => channel.type === ChannelType.GuildVoice
    );

    // Create "signedUpMembers" property and cache the list of
    // signed up members in that voice channel.
    voiceChannels.forEach((voiceChannel) => {
      /*voiceChannel.signedUpMembers = voiceChannel.members.filter(
        (member) => !!db.data.users.find((user) => user.id === member.id)
      );*/

      /// FOR NOW, RECORD ALL!
      voiceChannel.signedUpMembers = voiceChannel.members;

      voiceChannel.members.forEach((member) => {
        const index = db.data.users.findIndex((user) => user.id === member.id);

        if (index === -1) {
          db.data.users.push({ id: member.id, username: member.username });
          member.done = false;
        } else {
          db.data.users[index].username = member.username;
          member.done = !!db.data.users[index].done;
        }
      });
    });

    await db.write();

    // Get only the voice channels which have signed up members in.
    const signedUpChannels = voiceChannels.filter(
      (channel) => channel.signedUpMembers.size > 0
    );

    // Check if bot has already established voice connection in this guild.
    const connection = getVoiceConnection(guild.id);

    // If the connection exists already and there's no channel with signed up members,
    // disconnect and quit.
    if (connection && signedUpChannels.size <= 0) {
      connection.destroy();
      return;
    }

    // Iterate through each member and calculate the collected sample sizes.
    // Find the channel with the lowest total sample size and set it as target.
    const targetChannel = { id: -1, size: -1, channel: undefined };

    signedUpChannels.forEach((channel) => {
      channel.size = 0;

      channel.signedUpMembers.forEach((member) => {
        member.audioFileNum = 0;

        // File path should be ~/audio/{memberId}/{number}
        member.userAudioDir = path.join(__dirname, "audio", member.id);

        if (fs.existsSync(member.userAudioDir)) {
          // Iterate through the existing audio files.
          const audioFiles = fs.readdirSync(member.userAudioDir);

          for (const audioFile of audioFiles) {
            // Count the file number to get the next available one.
            const fileNum = parseInt(audioFile);

            if (!isNaN(fileNum) && fileNum >= member.audioFileNum) {
              member.audioFileNum = fileNum + 1;
            }
          }
        }

        // Cache the file path for the audio stream.
        member.audioFilePath = path.join(
          member.userAudioDir,
          member.audioFileNum.toString()
        );

        if (!member.done) {
          channel.size++;
        }
      });

      if (channel.size > targetChannel.size) {
        targetChannel.id = channel.id;
        targetChannel.size = channel.size;
        targetChannel.channel = channel;
      }
    });

    // If suitable target channel was found,
    if (targetChannel.size > 0) {
      const connection = joinVoiceChannel({
        channelId: targetChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      // Iterate through all signed up members in the voice channel.
      targetChannel.channel.signedUpMembers.each((member) => {
        // Check if a subscription has been made already.
        if (!member.done && !connection.receiver.subscriptions.has(member.id)) {
          fs.mkdirSync(member.userAudioDir, { recursive: true });

          // Subscribe to the target user's audio stream,
          // then pipe the opus stream through opus decoder,
          // then write it to the file stream.
          connection.receiver
            .subscribe(member.id)
            .pipe(
              new prism.opus.Decoder({
                frameSize: 960,
                channels: 2,
                rate: 48000,
              })
            )
            .pipe(fs.createWriteStream(member.audioFilePath));

          console.log(
            "\x1b[32m%s\x1b[0m %s",
            "[AUDIO]",
            `Audio receiver pipe established! userId: ${member.id}, path: ${member.audioFilePath}`
          );
        }
      });
    }
  },
};

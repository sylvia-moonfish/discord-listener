// This is used to deploy the list of commands to the server.

// Read env vars.
import dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

import { REST, Routes } from "discord.js";
import path from "node:path";
import { __dirname, forEachJsFile } from "#root/util.js";

// Read commands from commands directory.
const commands = [];

await forEachJsFile(path.join(__dirname, "commands"), (jsFile, jsFilePath) => {
  if ("data" in jsFile && "execute" in jsFile) {
    commands.push(jsFile.data.toJSON());
    console.log(
      "\x1b[32m%s\x1b[0m %s",
      "[COMMAND]",
      `"${jsFile.data.name}" registered.`
    );
  } else {
    console.log(
      "\x1b[31m%s\x1b[0m %s",
      "[WARNING]",
      `The command at ${jsFilePath} is missing required properties.`
    );
  }
});

// Create a REST client with discord token.
const rest = new REST().setToken(DISCORD_TOKEN);

// Refresh all commands through REST.
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // Empty existing commands.
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [],
    });

    // Put all commands in.
    const data = await rest.put(
      Routes.applicationCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m %s", "[ERROR]", err);
  }
})();

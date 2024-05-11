// Set up env var and retrieve necessary values.
import dotenv from "dotenv";
dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Start of index.js
import { Client, Collection, GatewayIntentBits } from "discord.js";
import path from "node:path";
import { __dirname, forEachJsFile } from "#root/util.js";

// Create and cache discord bot client.
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.commands = new Collection();

// Read the list of commands from 'commands' directory and register them.
await forEachJsFile(path.join(__dirname, "commands"), (jsFile, jsFilePath) => {
  if ("data" in jsFile && "execute" in jsFile) {
    client.commands.set(jsFile.data.name, jsFile);
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

// Read the list of events from 'events' directory and register them
// by relaying event listeners.
await forEachJsFile(path.join(__dirname, "events"), (jsFile) => {
  if (jsFile.once) {
    client.once(jsFile.name, (...args) => jsFile.execute(...args));
  } else {
    client.on(jsFile.name, (...args) => jsFile.execute(...args));
  }

  console.log(
    "\x1b[32m%s\x1b[0m %s",
    "[EVENT]",
    `"${jsFile.name}" registered.`
  );
});

// Connect the client with the env var token.
client.login(DISCORD_TOKEN);

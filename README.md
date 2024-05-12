# Discord Listener Bot

This bot joins discord voice channels automatically to collect voice samples for TTS AI voice cloning.

Supported commands:
- /signup: Users can sign up for the AI voice cloning.
- /status: Users can check their current sign up status.

## Prerequisites

This project has been ran mainly on:
- ubuntu 24.04 LTS
- Node.js v20.13.1
- Python 3.12.3

It needs the following installed on linux/ubuntu:
- make
- cc
- g++

## Initial setup

Look at .env.example and create a .env file.
- CLIENT_ID: Application ID of the discord bot that will act as a listener bot.
- DISCORD_TOKEN: OAuth2 client secret of the discord bot.
- GUILD_ID: Target guild ID that this bot will run on.

## Running the bot

- `npm run deploy`: Deploys bot commands to the target discord guild. This has to be ran after bot joins the guild.

- `npm run start`: This will start the bot and begin listening to the discord websocket/API.

## Collected samples

The sign up members and their data will be recorded as a local json file named `.db.json`.

The collected audio samples will be in the `audio` directory. The samples are organized by each member's discord user id. Use the following command with ffmpeg to convert the samples to wav file.

```
ffmpeg -f s16le -ar 48k -ac 2 -i {input_filename} {output_filename}.wav
```

The converted wav files can then be used with RVC. However, it is recommended to remove silences, convert to mono and concatenate all wav files before putting it into RVC.
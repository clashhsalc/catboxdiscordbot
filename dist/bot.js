"use strict";
// This file contains the main logic for the Discord bot, including command handling and interaction with the Discord API.
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const upload_1 = require("./commands/upload");
const config_1 = require("./config/config");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!upload')) {
        await (0, upload_1.uploadCommand)(message);
    }
});
client.login(config_1.config.BOT_TOKEN);

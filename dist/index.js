"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const dotenv_1 = require("dotenv");
const discord_js_1 = require("discord.js");
const generateuploadlink_1 = require("./commands/generateuploadlink");
require("./server");
(0, dotenv_1.config)();
exports.client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds]
});
exports.client.once(discord_js_1.Events.ClientReady, () => {
    console.log('Bot is ready!');
});
exports.client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'generateuploadlink') {
        await (0, generateuploadlink_1.execute)(interaction);
    }
});
exports.client.login(process.env.DISCORD_TOKEN);

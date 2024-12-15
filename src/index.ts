import { config } from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { execute as executeGenerateUploadLink } from './commands/generateuploadlink';
import './server';

config();

export const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, () => {
    console.log('Bot is ready!');
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'generateuploadlink') {
        await executeGenerateUploadLink(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);
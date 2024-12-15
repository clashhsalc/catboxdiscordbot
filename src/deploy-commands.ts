import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { data as generateUploadLinkCommand } from './commands/generateuploadlink';

dotenv.config();

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    throw new Error('Missing required environment variables');
}

const commands = [generateUploadLinkCommand];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application commands.');
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID is not defined');
        }
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();
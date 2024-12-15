import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN must be provided in environment variables');
}

export default {
    discordToken: process.env.DISCORD_TOKEN,
    catboxUserHash: process.env.CATBOX_USER_HASH
};
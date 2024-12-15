import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import crypto from 'crypto';
import { tokenStore } from '../utils/tokenStore';

export const data = new SlashCommandBuilder()
    .setName('generateuploadlink')
    .setDescription('Generate a temporary file upload link');

export async function execute(interaction: CommandInteraction) {
    const token = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + 600000; // 10 minutes

    tokenStore.setToken(token, {
        channelId: interaction.channelId,
        userId: interaction.user.id,
        expires,
        visited: false
    });

    const uploadUrl = `http://localhost:3000/upload/${token}`;
    await interaction.reply({
        content: `Here's your upload link (valid for 10 minutes):\n${uploadUrl}`,
        ephemeral: true
    });
}
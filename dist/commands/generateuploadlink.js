"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = exports.uploadUrls = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const crypto_1 = __importDefault(require("crypto"));
exports.uploadUrls = new Map();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
exports.data = new builders_1.SlashCommandBuilder()
    .setName('generateuploadlink')
    .setDescription('Generate a temporary file upload link');
async function execute(interaction) {
    const token = crypto_1.default.randomBytes(16).toString('hex');
    const expires = Date.now() + 180000; // 3 minutes
    exports.uploadUrls.set(token, {
        channelId: interaction.channelId,
        expires
    });
    const uploadUrl = `${BASE_URL}/upload/${token}`;
    await interaction.reply({
        content: `Here's your upload link (valid for 30 minutes):\n${uploadUrl}`,
        ephemeral: true
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN must be provided in environment variables');
}
exports.default = {
    discordToken: process.env.DISCORD_TOKEN,
    catboxUserHash: process.env.CATBOX_USER_HASH
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const generateuploadlink_1 = require("./src/commands/generateuploadlink");
dotenv_1.default.config();
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    throw new Error('Missing required environment variables');
}
const commands = [generateuploadlink_1.data];
const rest = new discord_js_1.REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log('Started refreshing application commands.');
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID is not defined');
        }
        await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Successfully registered application commands.');
    }
    catch (error) {
        console.error(error);
    }
})();

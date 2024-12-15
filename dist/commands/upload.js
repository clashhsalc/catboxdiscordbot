"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
exports.uploadCommand = uploadCommand;
exports.handleFileUpload = handleFileUpload;
const catbox_service_1 = require("../services/catbox-service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const uploadFile = async (file) => {
    const maxSize = 8 * 1024 * 1024; // 8MB in bytes
    if (file.size > maxSize) {
        const catboxService = new catbox_service_1.CatboxService();
        try {
            const tempFilePath = path.join(os.tmpdir(), file.name);
            fs.writeFileSync(tempFilePath, Buffer.from(await file.arrayBuffer()));
            const response = await catboxService.uploadFile(tempFilePath);
            fs.unlinkSync(tempFilePath);
            return response; // rturns the URL of the uploaded file
        }
        catch (error) {
            console.error('Error uploading to Catbox:', error);
            throw new Error('Failed to upload file to Catbox.');
        }
    }
    else {
        throw new Error('File size must be greater than 8MB to upload.');
    }
};
exports.uploadFile = uploadFile;
async function uploadCommand(message) {
    if (message.attachments.size === 0) {
        await message.reply('Please attach a file!');
        return;
    }
    const attachment = message.attachments.first();
    if (!attachment)
        return;
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (attachment.size > maxSize) {
        const reply = await message.reply('Processing large file...');
        try {
            // Download file to temp directory
            const response = await fetch(attachment.url);
            const buffer = await response.arrayBuffer();
            const tempPath = path.join(os.tmpdir(), attachment.name);
            fs.writeFileSync(tempPath, Buffer.from(buffer));
            // Upload to Catbox
            const catboxService = new catbox_service_1.CatboxService();
            const catboxUrl = await catboxService.uploadFile(tempPath);
            // Clean up temp file
            fs.unlinkSync(tempPath);
            await reply.edit(`File was too large for Discord (${attachment.size} bytes). Uploaded to: ${catboxUrl}`);
        }
        catch (error) {
            console.error('Error:', error);
            await reply.edit('Failed to upload file to Catbox.');
        }
    }
    else {
        await message.reply({ files: [attachment] });
    }
}
async function handleFileUpload(interaction) {
    if (!interaction.isCommand())
        return;
    const attachment = interaction.options.get('file')?.attachment;
    if (!attachment) {
        await interaction.reply('Please provide a file!');
        return;
    }
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (attachment.size > maxSize) {
        await interaction.deferReply();
        try {
            // Download file to temp directory
            const response = await fetch(attachment.url);
            const buffer = await response.arrayBuffer();
            const tempPath = path.join(os.tmpdir(), attachment.name);
            fs.writeFileSync(tempPath, Buffer.from(buffer));
            // Upload to Catbox
            const catboxService = new catbox_service_1.CatboxService();
            const catboxUrl = await catboxService.uploadFile(tempPath);
            // Clean up temp file
            fs.unlinkSync(tempPath);
            await interaction.editReply(`File was too large for Discord (${attachment.size} bytes). Uploaded to: ${catboxUrl}`);
        }
        catch (error) {
            console.error('Error:', error);
            await interaction.editReply('Failed to upload file to Catbox.');
        }
    }
    else {
        await interaction.reply({ files: [attachment] });
    }
}

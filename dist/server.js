"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUrls = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const form_data_1 = __importDefault(require("form-data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const index_1 = require("./index");
const discord_js_1 = require("discord.js");
exports.uploadUrls = new Map();
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB limit
    },
});
app.get('/upload/:token', (async (req, res) => {
    const { token } = req.params;
    const uploadInfo = exports.uploadUrls.get(token);
    // Log for debugging purposes
    console.log(`GET request for token: ${token}`, uploadInfo);
    if (!uploadInfo || uploadInfo.expires < Date.now()) {
        exports.uploadUrls.delete(token);
        return res.status(404).send('Invalid or expired upload link');
    }
    res.send(`
            <html>
                <head>
                    <title>Catbox Upload</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        form { max-width: 500px; margin: 0 auto; }
                        input, button { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <form action="/upload/${token}" method="post" enctype="multipart/form-data">
                        <h2>Upload to Catbox</h2>
                        <input type="file" name="file" required>
                        <br>
                        <button type="submit">Upload</button>
                    </form>
                </body>
            </html>
        `);
}));
app.post('/upload/:token', upload.single('file'), (async (req, res) => {
    const { token } = req.params;
    const uploadInfo = exports.uploadUrls.get(token);
    console.log(`POST request for token: ${token}`, uploadInfo);
    if (!uploadInfo || !req.file) {
        res.status(400).send('Invalid request or missing file');
        return;
    }
    if (uploadInfo.expires < Date.now()) {
        exports.uploadUrls.delete(token);
        res.status(410).send('Upload link has expired');
        return;
    }
    try {
        const form = new form_data_1.default();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', req.file.buffer, req.file.originalname);
        const catboxResponse = await (0, node_fetch_1.default)('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form,
        });
        if (!catboxResponse.ok) {
            throw new Error('Catbox upload failed');
        }
        const catboxUrl = await catboxResponse.text();
        const channel = await index_1.client.channels.fetch(uploadInfo.channelId);
        if (channel instanceof discord_js_1.TextChannel) {
            await channel.send(`✅ File uploaded: ${catboxUrl}`);
        }
        exports.uploadUrls.delete(token);
        res.send(`
                <html>
                    <body>
                        <h2>Upload Successful!</h2>
                        <p>Your file has been uploaded to: <a href="${catboxUrl}">${catboxUrl}</a></p>
                        <p>You can close this window now.</p>
                    </body>
                </html>
            `);
    }
    catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Upload failed. Please try again.');
    }
}));
// Debug function for adding tokens with expiration
function addUploadToken(token, channelId) {
    const expirationTime = Date.now() + 30 * 60 * 1000; // 30 minutes
    exports.uploadUrls.set(token, { channelId, expires: expirationTime });
    console.log(`Token added: ${token}, expires at: ${new Date(expirationTime).toISOString()}`);
}
app.listen(3000, () => {
    console.log('Upload server running on port 3000');
});

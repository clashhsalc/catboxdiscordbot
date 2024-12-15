import express, { Request, Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { client } from './index';
import { TextChannel } from 'discord.js';
import { tokenStore } from './utils/tokenStore';

const app = express();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB limit
    }
});

interface FileRequest extends Request<ParamsDictionary> {
    file?: Express.Multer.File
}

interface TokenParams extends ParamsDictionary {
    token: string;
}

type TypedRequestHandler<P> = RequestHandler<P, any, any, ParsedQs, Record<string, any>>;

app.get('/upload/:token', ((req: Request<TokenParams>, res: Response) => {
    const { token } = req.params;
    const uploadInfo = tokenStore.getToken(token);
    
    console.log('Token validation:', {
        token,
        info: uploadInfo,
        currentTime: Date.now()
    });

    if (!uploadInfo) {
        return res.status(404).send('Upload link not found');
    }

    // Update visit status and extend expiry if first visit
    if (!uploadInfo.visited) {
        uploadInfo.visited = true;
        uploadInfo.expires = Date.now() + 600000; // 10 minutes from first visit
        tokenStore.setToken(token, uploadInfo);
    }

    const timeRemaining = uploadInfo.expires - Date.now();
    if (timeRemaining < 0) {
        tokenStore.deleteToken(token);
        return res.status(410).send('Upload link has expired');
    }

    res.send(`
        <html>
            <head>
                <title>Catbox Upload</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .timer {
                        color: #666;
                        margin: 15px 0;
                        font-size: 0.9em;
                    }
                    .progress-container {
                        margin: 20px 0;
                        background: #eee;
                        border-radius: 5px;
                        overflow: hidden;
                        display: none;
                    }
                    .progress-bar {
                        width: 0%;
                        height: 20px;
                        background: #4CAF50;
                        transition: width 0.3s ease;
                    }
                    .file-input {
                        width: 100%;
                        padding: 10px;
                        margin: 10px 0;
                    }
                    .upload-btn {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background 0.3s;
                    }
                    .upload-btn:hover {
                        background: #45a049;
                    }
                    .status {
                        margin-top: 15px;
                        font-weight: bold;
                    }
                </style>
                <script>
                    const expiryTime = ${uploadInfo.expires};
                    let uploadStarted = false;

                    function updateTimer() {
                        if (uploadStarted) return;
                        
                        const now = Date.now();
                        const timeLeft = expiryTime - now;
                        const timerElement = document.getElementById('timer');
                        
                        if (timeLeft <= 0) {
                            timerElement.textContent = 'Link has expired';
                            timerElement.style.color = 'red';
                            document.getElementById('uploadForm').style.display = 'none';
                            clearInterval(timerInterval);
                            return;
                        }
                        
                        const minutes = Math.floor(timeLeft / 60000);
                        const seconds = Math.ceil((timeLeft % 60000) / 1000);
                        timerElement.textContent = \`Link expires in \${minutes}m \${seconds}s\`;
                    }

                    async function uploadFile(event) {
                        event.preventDefault();
                        const form = event.target;
                        const fileInput = form.querySelector('input[type="file"]');
                        const file = fileInput.files[0];
                        
                        if (!file) {
                            alert('Please select a file');
                            return;
                        }

                        uploadStarted = true;
                        document.querySelector('.progress-container').style.display = 'block';
                        const formData = new FormData(form);
                        
                        try {
                            const xhr = new XMLHttpRequest();
                            xhr.open('POST', form.action);
                            
                            xhr.upload.onprogress = (e) => {
                                if (e.lengthComputable) {
                                    const percent = (e.loaded / e.total) * 100;
                                    document.querySelector('.progress-bar').style.width = percent + '%';
                                    document.querySelector('.status').textContent = 
                                        \`Uploading: \${Math.round(percent)}%\`;
                                }
                            };
                            
                            xhr.onload = () => {
                                if (xhr.status === 200) {
                                    document.querySelector('.container').innerHTML = xhr.responseText;
                                } else {
                                    document.querySelector('.status').textContent = 
                                        'Upload failed: ' + xhr.statusText;
                                }
                            };
                            
                            xhr.onerror = () => {
                                document.querySelector('.status').textContent = 
                                    'Upload failed. Please try again.';
                            };
                            
                            xhr.send(formData);
                        } catch (error) {
                            document.querySelector('.status').textContent = 
                                'Upload failed: ' + error.message;
                        }
                    }

                    const timerInterval = setInterval(updateTimer, 1000);
                    updateTimer();
                </script>
            </head>
            <body>
                <div class="container">
                    <h2>Upload to Catbox</h2>
                    <div id="timer" class="timer"></div>
                    <form id="uploadForm" action="/upload/${token}" 
                          method="post" enctype="multipart/form-data" 
                          onsubmit="uploadFile(event)">
                        <input type="file" name="file" required class="file-input">
                        <div class="progress-container">
                            <div class="progress-bar"></div>
                        </div>
                        <div class="status"></div>
                        <button type="submit" class="upload-btn">Upload File</button>
                    </form>
                </div>
            </body>
        </html>
    `);
}) as TypedRequestHandler<TokenParams>);
app.post('/upload/:token', 
    upload.single('file'), 
    (async (req: FileRequest & Request<TokenParams>, res: Response): Promise<void> => {
        const { token } = req.params;
        const uploadInfo = tokenStore.getToken(token);
        
        if (!uploadInfo || !req.file) {
            res.status(400).send('Invalid request or missing file');
            return;
        }

        try {
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', req.file.buffer, req.file.originalname);

            const catboxResponse = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            });

            if (!catboxResponse.ok) {
                throw new Error('Catbox upload failed');
            }

            const catboxUrl = await catboxResponse.text();
            
            // Send public message with user mention
            const channel = await client.channels.fetch(uploadInfo.channelId) as TextChannel;
            if (channel instanceof TextChannel) {
                await channel.send({
                    content: `📎 File uploaded by <@${uploadInfo.userId}>\n🔗 ${catboxUrl}\n📁 ${req.file.originalname}\n📦 Size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`
                });
            }

            tokenStore.deleteToken(token);
            res.send(`
                <html>
                    <body>
                        <h2>Upload Successful!</h2>
                        <p>Your file has been uploaded to: <a href="${catboxUrl}">${catboxUrl}</a></p>
                        <p>The link has been posted in the Discord channel.</p>
                        <p>You can close this window now.</p>
                    </body>
                </html>
            `);
        } catch (error) {
            console.error(error);
            res.status(500).send('Upload failed. Please try again.');
        }
    }) as TypedRequestHandler<TokenParams>
);

app.listen(3000, () => {
    console.log('Upload server running on port 3000');
});
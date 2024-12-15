"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatboxService = void 0;
const node_catbox_1 = require("node-catbox");
class CatboxService {
    constructor(userHash) {
        this.catbox = new node_catbox_1.Catbox(userHash);
    }
    async uploadFile(filePath) {
        try {
            const response = await this.catbox.uploadFile({
                path: filePath
            });
            return response;
        }
        catch (error) {
            console.error('Catbox upload error:', error);
            throw error;
        }
    }
    setUserHash(userHash) {
        this.catbox.setUserHash(userHash);
    }
}
exports.CatboxService = CatboxService;

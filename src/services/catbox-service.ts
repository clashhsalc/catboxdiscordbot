import { Catbox } from 'node-catbox';

export class CatboxService {
    private catbox: Catbox;

    constructor(userHash?: string) {
        this.catbox = new Catbox(userHash);
    }

    async uploadFile(filePath: string) {
        try {
            const response = await this.catbox.uploadFile({
                path: filePath
            });
            return response;
        } catch (error) {
            console.error('Catbox upload error:', error);
            throw error;
        }
    }

    setUserHash(userHash: string): void {
        this.catbox.setUserHash(userHash);
    }
}
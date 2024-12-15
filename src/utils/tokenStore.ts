interface UploadInfo {
    channelId: string;
    userId: string;
    expires: number;
    visited: boolean;
}

class TokenStore {
    private static instance: TokenStore;
    private tokens: Map<string, UploadInfo>;

    private constructor() {
        this.tokens = new Map();
    }

    public static getInstance(): TokenStore {
        if (!TokenStore.instance) {
            TokenStore.instance = new TokenStore();
        }
        return TokenStore.instance;
    }

    public setToken(token: string, info: UploadInfo): void {
        this.tokens.set(token, info);
        console.log('Token stored:', { token, info });
    }

    public getToken(token: string): UploadInfo | undefined {
        return this.tokens.get(token);
    }

    public deleteToken(token: string): void {
        this.tokens.delete(token);
    }
}

export const tokenStore = TokenStore.getInstance();
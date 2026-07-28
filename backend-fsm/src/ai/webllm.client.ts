export interface LocalLlmClient {
    isAvailable(): boolean;
    completeJson(prompt: string): Promise<unknown>;
}

export class WebLlmUnavailableError extends Error {
    constructor() {
        super('WebLLM client is not initialized in this workspace yet.');
        this.name = 'WebLlmUnavailableError';
    }
}

export const webLlmClient: LocalLlmClient = {
    isAvailable: () => false,
    completeJson: async () => {
        throw new WebLlmUnavailableError();
    },
};

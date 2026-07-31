import { clearSessionKey } from './keyManager';
export interface PurgeConfig {
    purgeOnHide: boolean;
}

const defaultConfig: PurgeConfig = {
    purgeOnHide: false,
};

let visibilityListener: (() => void) | null = null;
let unloadListener: (() => void) | null = null;

export function initPurgeListeners(config: Partial<PurgeConfig> = {}): () => void {
    const resolvedConfig: PurgeConfig = { ...defaultConfig, ...config };

    visibilityListener = () => {
        if (document.visibilityState === 'hidden' && resolvedConfig.purgeOnHide) {
            clearSessionKey();
        }
    };

    unloadListener = () => {
        clearSessionKey();
    };

    document.addEventListener('visibilitychange', visibilityListener);
    window.addEventListener('beforeunload', unloadListener);
    return function teardownPurgeListeners(): void {
        if (visibilityListener) {
            document.removeEventListener('visibilitychange', visibilityListener);
            visibilityListener = null;
        }
        if (unloadListener) {
            window.removeEventListener('beforeunload', unloadListener);
            unloadListener = null;
        }
    };
}
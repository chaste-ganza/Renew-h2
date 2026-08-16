import * as webllm from '@mlc-ai/web-llm';

export type ModelLoadProgressCallback = (progress: {
    progressPercent: number;
    text: string;
}) => void;

let engineInstance: webllm.MLCEngine | null = null;

let loadingPromise: Promise<webllm.MLCEngine> | null = null;

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

export function isWebGpuSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export async function getEngine(
    onProgress?: ModelLoadProgressCallback
): Promise<webllm.MLCEngine> {
    if (engineInstance) {
        return engineInstance;
    }

    if (!isWebGpuSupported()) {
        throw new Error(
            'WebGPU is not supported in this browser. The AI rephrasing ' +
            'feature requires WebGPU; static questions will be used as a fallback.'
        );
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
            onProgress?.({
                progressPercent: Math.round(report.progress * 100),
                text: report.text,
            });
        },
    });

    engineInstance = await loadingPromise;
    loadingPromise = null;

    return engineInstance;
}

export async function unloadEngine(): Promise<void> {
    if (engineInstance) {
        await engineInstance.unload();
        engineInstance = null;
    }
}
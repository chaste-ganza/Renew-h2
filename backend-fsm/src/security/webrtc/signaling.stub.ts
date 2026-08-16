export interface SignalingMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface SignalingChannel {
    send(message: SignalingMessage): Promise<void>;
    onMessage(handler: (message: SignalingMessage) => void): () => void; // returns unsubscribe
    close(): void;
}

export class StubSignalingChannel implements SignalingChannel {
    private handlers: Set<(message: SignalingMessage) => void> = new Set();

    async send(message: SignalingMessage): Promise<void> {
        console.warn(
            '[StubSignalingChannel] send() called but no real transport is ' +
            'wired up. Message was NOT sent:',
            message
        );
    }

    onMessage(handler: (message: SignalingMessage) => void): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    close(): void {
        this.handlers.clear();
    }
}